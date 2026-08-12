"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useAdmin } from "../hooks/useAdmin";
import EditableText from "./EditableText";

export default function VisiMisi() {
  const { isAdmin } = useAdmin();
  const [data, setData] = useState(null);

  async function load() {
    const { data: row } = await supabase
      .from("visi_misi")
      .select("*")
      .eq("id", 1)
      .maybeSingle();
    setData(row);
  }

  useEffect(() => {
    load();
  }, []);

  async function updateField(field, value) {
    await supabase.from("visi_misi").update({ [field]: value }).eq("id", 1);
    setData((prev) => ({ ...prev, [field]: value }));
  }

  if (!data) return null;

  return (
    <section className="visimisi" id="visimisi">
      <div className="visimisi-inner">
        <div className="bso-head">
          <span className="section-eyebrow on-paper">Visi &amp; Misi</span>
          <h2 className="section-title on-paper reveal">Arah gerak RISPI</h2>
        </div>
        <div className="visimisi-grid reveal">
          <div className="visimisi-card">
            <div className="k-label">Visi</div>
            <EditableText
              as="p"
              value={data.visi}
              isAdmin={isAdmin}
              multiline
              placeholder="(kosong — klik untuk isi visi)"
              onSave={(v) => updateField("visi", v)}
            />
          </div>
          <div className="visimisi-card">
            <div className="k-label">Misi</div>
            <EditableText
              as="p"
              value={data.misi}
              isAdmin={isAdmin}
              multiline
              placeholder="(kosong — klik untuk isi misi)"
              onSave={(v) => updateField("misi", v)}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
