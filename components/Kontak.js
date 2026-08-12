"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useAdmin } from "../hooks/useAdmin";
import EditableText from "./EditableText";
import SectionSkeleton from "./SectionSkeleton";

export default function Kontak() {
  const { isAdmin } = useAdmin();
  const [data, setData] = useState(null);

  async function load() {
    const { data: row } = await supabase
      .from("kontak")
      .select("*")
      .eq("id", 1)
      .maybeSingle();
    setData(row);
  }

  useEffect(() => {
    load();
  }, []);

  async function updateField(field, value) {
    await supabase.from("kontak").update({ [field]: value }).eq("id", 1);
    setData((prev) => ({ ...prev, [field]: value }));
  }

  if (!data) return <SectionSkeleton theme="paper" minHeight={420} />;

  return (
    <section className="kontak" id="kontak">
      <div className="kontak-inner">
        <div className="bso-head">
          <span className="section-eyebrow on-paper">Kontak</span>
          <h2 className="section-title on-paper reveal">Mari terhubung</h2>
          <p className="section-sub on-paper reveal reveal-delay-1">
            Punya pertanyaan seputar program, BSO, atau ingin berkolaborasi?
            Sampaikan pesan kepada kami.
          </p>
        </div>
        <div className="kontak-grid">
          <div className="kontak-card reveal">
            <div className="kontak-row">
              <div className="kontak-icon">@</div>
              <div>
                <div className="kontak-label">Alamat</div>
                <EditableText
                  as="div"
                  className="kontak-value"
                  value={data.alamat}
                  isAdmin={isAdmin}
                  multiline
                  onSave={(v) => updateField("alamat", v)}
                />
              </div>
            </div>
            <div className="kontak-row">
              <div className="kontak-icon">wa</div>
              <div>
                <div className="kontak-label">Kerja sama</div>
                <EditableText
                  as="div"
                  className="kontak-value"
                  value={data.kerja_sama}
                  isAdmin={isAdmin}
                  onSave={(v) => updateField("kerja_sama", v)}
                />
              </div>
            </div>
            <div className="kontak-row">
              <div className="kontak-icon">ig</div>
              <div>
                <div className="kontak-label">Instagram</div>
                {isAdmin ? (
                  <EditableText
                    as="div"
                    className="kontak-value"
                    value={data.instagram}
                    isAdmin={isAdmin}
                    onSave={(v) => updateField("instagram", v)}
                  />
                ) : (
                  <a
                    className="kontak-value kontak-link"
                    href="https://www.instagram.com/ukkrispi"
                    target="_blank"
                    rel="noreferrer"
                  >
                    {data.instagram}
                  </a>
                )}
              </div>
            </div>
          </div>
          <div className="kontak-cta reveal reveal-delay-1">
            <h3>Siap bergabung?</h3>
            <p>
              Isi formulir pendaftaran resmi melalui Google Form untuk menjadi
              bagian dari UKK RISPI.
            </p>
            {isAdmin ? (
              <EditableText
                className="btn-white"
                value={data.form_url || "(tempel URL Google Form)"}
                isAdmin={isAdmin}
                onSave={(v) => updateField("form_url", v)}
              />
            ) : (
              <a href={data.form_url || "#"} className="btn-white">
                Daftar via Google Form
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
