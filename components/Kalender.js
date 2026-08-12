"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useAdmin } from "../hooks/useAdmin";
import EditableText from "./EditableText";
import { monthNames, weekdayLabels } from "../data/events";

function keyFor(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function todayKey() {
  const d = new Date();
  return keyFor(d.getFullYear(), d.getMonth(), d.getDate());
}

export default function Kalender() {
  const { isAdmin } = useAdmin();
  const now = new Date();
  const [calYear, setCalYear] = useState(now.getFullYear());
  const [calMonth, setCalMonth] = useState(now.getMonth());
  const [selectedKey, setSelectedKey] = useState(null);
  const [events, setEvents] = useState({});
  const [loading, setLoading] = useState(true);

  async function load() {
    const { data } = await supabase.from("calendar_events").select("*");
    const map = {};
    (data || []).forEach((row) => {
      map[row.event_date] = row;
    });
    setEvents(map);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  const cells = useMemo(() => {
    const firstWeekday = new Date(calYear, calMonth, 1).getDay();
    const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
    const list = [];
    for (let i = 0; i < firstWeekday; i++) {
      list.push({ empty: true, key: `empty-${i}` });
    }
    const tKey = todayKey();
    for (let d = 1; d <= daysInMonth; d++) {
      const key = keyFor(calYear, calMonth, d);
      list.push({
        empty: false,
        key,
        day: d,
        hasEvent: Boolean(events[key]),
        isToday: key === tKey,
      });
    }
    return list;
  }, [calYear, calMonth, events]);

  const goPrev = () => {
    setCalMonth((m) => {
      if (m === 0) {
        setCalYear((y) => y - 1);
        return 11;
      }
      return m - 1;
    });
  };
  const goNext = () => {
    setCalMonth((m) => {
      if (m === 11) {
        setCalYear((y) => y + 1);
        return 0;
      }
      return m + 1;
    });
  };

  async function updateEventField(field, value) {
    const ev = events[selectedKey];
    if (!ev) return;
    await supabase.from("calendar_events").update({ [field]: value }).eq("id", ev.id);
    setEvents((prev) => ({
      ...prev,
      [selectedKey]: { ...prev[selectedKey], [field]: value },
    }));
  }

  async function addEvent() {
    const { data } = await supabase
      .from("calendar_events")
      .insert({
        event_date: selectedKey,
        title: "Judul acara",
        time_label: "00.00 WIB",
        location: "Lokasi acara",
        description: "",
      })
      .select()
      .single();
    if (data) setEvents((prev) => ({ ...prev, [selectedKey]: data }));
  }

  async function removeEvent() {
    const ev = events[selectedKey];
    if (!ev) return;
    if (!confirm("Hapus acara ini?")) return;
    await supabase.from("calendar_events").delete().eq("id", ev.id);
    setEvents((prev) => {
      const next = { ...prev };
      delete next[selectedKey];
      return next;
    });
  }

  if (loading) return null;

  const selectedEvent = selectedKey ? events[selectedKey] : null;
  const selectedDateLabel = selectedKey
    ? `${selectedKey.split("-")[2]} ${monthNames[parseInt(selectedKey.split("-")[1], 10) - 1]} ${selectedKey.split("-")[0]}`
    : null;

  return (
    <section className="kalender" id="kalender">
      <div className="kalender-inner">
        <div className="kalender-head">
          <span className="section-eyebrow on-paper">Agenda</span>
          <h2 className="section-title on-paper reveal">Kalender kegiatan</h2>
          <p className="section-sub on-paper reveal reveal-delay-1">
            Pantau jadwal kajian, workshop, dan tenggat publikasi RISPI. Klik
            tanggal yang bertanda untuk lihat detail acaranya.
          </p>
        </div>

        <div className="kalender-grid">
          <div className="cal-card reveal">
            <div className="cal-nav">
              <div className="cal-month">
                {monthNames[calMonth]} {calYear}
              </div>
              <div className="cal-arrows">
                <button className="cal-arrow" aria-label="Bulan sebelumnya" onClick={goPrev}>
                  &larr;
                </button>
                <button className="cal-arrow" aria-label="Bulan berikutnya" onClick={goNext}>
                  &rarr;
                </button>
              </div>
            </div>
            <div className="cal-weekdays">
              {weekdayLabels.map((w) => (
                <span key={w}>{w}</span>
              ))}
            </div>
            <div className="cal-days">
              {cells.map((cell) => {
                if (cell.empty) {
                  return <div className="cal-cell empty" key={cell.key}></div>;
                }
                const clickable = cell.hasEvent || isAdmin;
                const classes = [
                  "cal-cell",
                  cell.hasEvent ? "has-event" : "",
                  cell.isToday ? "is-today" : "",
                  cell.key === selectedKey ? "is-selected" : "",
                  isAdmin && !cell.hasEvent ? "admin-empty" : "",
                ]
                  .filter(Boolean)
                  .join(" ");
                return (
                  <div
                    className={classes}
                    key={cell.key}
                    onClick={clickable ? () => setSelectedKey(cell.key) : undefined}
                  >
                    <span>{cell.day}</span>
                    {cell.hasEvent && <span className="cal-dot"></span>}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="detail-card reveal reveal-delay-1">
            {selectedEvent ? (
              <>
                <div className="detail-date-badge">{selectedDateLabel}</div>
                <EditableText
                  as="div"
                  className="detail-title"
                  value={selectedEvent.title}
                  isAdmin={isAdmin}
                  onSave={(v) => updateEventField("title", v)}
                />
                <div className="detail-meta">
                  <div className="detail-meta-row">
                    <b>Waktu</b>
                    <EditableText
                      value={selectedEvent.time_label}
                      isAdmin={isAdmin}
                      onSave={(v) => updateEventField("time_label", v)}
                    />
                  </div>
                  <div className="detail-meta-row">
                    <b>Lokasi</b>
                    <EditableText
                      value={selectedEvent.location}
                      isAdmin={isAdmin}
                      onSave={(v) => updateEventField("location", v)}
                    />
                  </div>
                </div>
                <EditableText
                  as="div"
                  className="detail-desc"
                  value={selectedEvent.description}
                  isAdmin={isAdmin}
                  multiline
                  onSave={(v) => updateEventField("description", v)}
                />
                {isAdmin && (
                  <button
                    className="edit-btn small danger"
                    style={{ marginTop: 14, alignSelf: "flex-start" }}
                    onClick={removeEvent}
                  >
                    Hapus acara
                  </button>
                )}
              </>
            ) : selectedKey && isAdmin ? (
              <div className="detail-empty">
                <span>+</span>
                Belum ada acara di tanggal {selectedDateLabel}.
                <button
                  className="edit-btn"
                  style={{ marginTop: 14 }}
                  onClick={addEvent}
                >
                  + Tambah acara di tanggal ini
                </button>
              </div>
            ) : (
              <div className="detail-empty">
                <span>&mdash;</span>
                Pilih tanggal yang bertanda titik merah untuk melihat kegiatan
                hari itu.
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
