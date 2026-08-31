import React, { useState, useEffect } from "react";
import { Users, Search, Trash2, MapPin, Wheat } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

export default function AdminFarmers() {
  const { toast } = useToast();
  const [users, setUsers] = useState([]);
  const [farms, setFarms] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    Promise.all([
      base44.entities.User.list().catch(() => []),
      base44.entities.Farm.list().catch(() => []),
    ]).then(([u, f]) => {
      setUsers(u.filter((x) => x.role !== "admin"));
      setFarms(f);
      setLoading(false);
    });
  };
  useEffect(() => { load(); }, []);

  const farmFor = (userId) => farms.find((f) => f.created_by_id === userId);

  const filtered = users.filter((u) => (u.full_name || "").toLowerCase().includes(search.toLowerCase()) || (u.email || "").toLowerCase().includes(search.toLowerCase()));

  const removeFarmer = async (u) => {
    if (!confirm(`Delete farmer ${u.full_name}? This cannot be undone.`)) return;
    try {
      const f = farmFor(u.id);
      if (f) await base44.entities.Farm.delete(f.id);
      await base44.entities.User.delete(u.id);
      load();
      toast({ title: "Farmer removed" });
    } catch (e) {
      toast({ title: "Failed", description: e.message, variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2"><Users className="w-6 h-6 text-[hsl(var(--km-green))]" /> Farmers</h1>
        <p className="text-muted-foreground mt-1">{users.length} registered farmers</p>
      </div>

      <div className="relative max-w-md">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or email…" className="input-base pl-10" />
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : filtered.length === 0 ? (
        <div className="km-card p-8 text-center text-muted-foreground text-sm">No farmers found.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((u) => {
            const f = farmFor(u.id);
            return (
              <div key={u.id} className="km-card km-shadow p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-white font-semibold">
                    {(u.full_name || "F").charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{u.full_name || "Unnamed"}</p>
                    <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                  </div>
                </div>
                <div className="space-y-1.5 text-sm text-muted-foreground">
                  {f ? (
                    <>
                      <p className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5" /> {f.location || "—"}, {f.district || ""}</p>
                      <p className="flex items-center gap-2"><Wheat className="w-3.5 h-3.5" /> {f.primary_crop || "—"} • {f.farm_size} {f.farm_size_unit}</p>
                    </>
                  ) : (
                    <p className="italic">No farm profile yet</p>
                  )}
                </div>
                <Button onClick={() => removeFarmer(u)} variant="outline" className="w-full mt-4 text-red-600 hover:text-red-700 hover:bg-red-50">
                  <Trash2 className="w-4 h-4 mr-2" /> Remove Farmer
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}