"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CreateUMKMDialog } from "@/components/create-umkm-dialog";
import { EditUMKMDialog } from "@/components/edit-umkm-dialog";
import { DeleteUMKMDialog } from "@/components/delete-umkm-dialog";
import { Search } from "lucide-react";
// import type { UMKM } from "@/components/edit-umkm-dialog";
import { useToast } from "@/components/ui/use-toast";

interface UMKM {
  id: number;
  name: string;
  type: string;
  location: string;
  status: string; // ✅ Pastikan ada properti status
}

export default function AllUMKMs() {
  const [searchTerm, setSearchTerm] = useState("");
  const [umkmData, setUMKMData] = useState<UMKM[]>([]);
  const router = useRouter();
  const [selectedUMKMId, setSelectedUMKMId] = useState<number | null>(null);
  const { toast } = useToast();

  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

  // ✅ Pindahkan fetchUMKMs ke fungsi global agar bisa dipanggil di mana saja dalam komponen
  const fetchUMKMs = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/umkms`, {
        headers: { Accept: "application/json" },
      });
      if (!res.ok) throw new Error("Failed to fetch UMKMs");

      const data = await res.json();
      setUMKMData(data);
    } catch (error) {
      console.error("Error fetching UMKMs:", error);
    }
  };

  // 🔥 Gunakan useEffect untuk memanggil fetchUMKMs saat pertama kali render
  useEffect(() => {
    fetchUMKMs();
  }, []);

  const handleDeleteUMKM = async (id: number) => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast({
        title: "Unauthorized",
        description: "You need to log in first!",
        variant: "destructive",
      });
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/umkms/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error(`Failed to delete UMKM. Status: ${res.status}`);
      }

      // ✅ Panggil fetchUMKMs setelah delete agar data diperbarui
      fetchUMKMs();

      toast({
        title: "UMKM Deleted",
        description: "UMKM has been removed.",
        variant: "destructive",
      });
    } catch (error) {
      console.error("Error deleting UMKM:", error);
      toast({
        title: "Error",
        description: "Failed to delete UMKM. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleViewDetails = (id: number) => {
    router.push(`/umkms/${id}`);
  };

  return (
    <div className="container mx-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-2xl font-bold">All UMKMs</CardTitle>
            <div className="flex items-center space-x-2">
              <Input
                type="text"
                placeholder="Search UMKMs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64"
              />
              <Button variant="outline" size="icon">
                <Search className="h-4 w-4" />
              </Button>
              <CreateUMKMDialog onCreateUMKM={fetchUMKMs} />
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {umkmData.map((umkm) => (
                  <TableRow key={umkm.id}>
                    <TableCell>{umkm.name}</TableCell>
                    <TableCell>{umkm.type}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          umkm.status === "Active"
                            ? "default"
                            : umkm.status === "Pending"
                            ? "secondary"
                            : "destructive"
                        }
                      >
                        {umkm.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        variant="outline"
                        onClick={() => handleViewDetails(umkm.id)}
                      >
                        View
                      </Button>
                      {/* ✅ Panggil fetchUMKMs setelah edit */}
                      {/* <Button
                        variant="outline"
                        onClick={() => setSelectedUMKMId(umkm.id)} // ⬅️ Set ID sebelum membuka modal
                      >
                        Edit
                      </Button>
                      {selectedUMKMId && (
                        <EditUMKMDialog
                          umkmId={selectedUMKMId}
                          onUpdate={fetchUMKMs}
                        />
                      )} */}
                      <DeleteUMKMDialog
                        umkmId={umkm.id}
                        umkmName={umkm.name}
                        onDelete={handleDeleteUMKM}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
