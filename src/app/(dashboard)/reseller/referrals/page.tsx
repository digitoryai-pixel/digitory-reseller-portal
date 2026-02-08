"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Search, PlusCircle, Upload, Loader2 } from "lucide-react";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { format } from "date-fns";
import Link from "next/link";
import { useCurrency } from "@/lib/currency-context";

interface Referral {
  id: string;
  companyName: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string | null;
  productInterest: string;
  estimatedValue: number | null;
  dealValue: number | null;
  status: string;
  notes: string | null;
  createdAt: string;
  commission: { commissionAmount: number; status: string } | null;
}

const STATUS_COLORS: Record<string, string> = {
  NEW: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  CONTACTED: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  QUALIFIED: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  PROPOSAL: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  NEGOTIATION: "bg-pink-500/10 text-pink-500 border-pink-500/20",
  WON: "bg-green-500/10 text-green-500 border-green-500/20",
  LOST: "bg-red-500/10 text-red-500 border-red-500/20",
};

const STATUSES = ["NEW", "CONTACTED", "QUALIFIED", "PROPOSAL", "NEGOTIATION", "WON", "LOST"];

export default function ResellerReferralsPage() {
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const { fc } = useCurrency();
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [csvDialog, setCsvDialog] = useState(false);
  const [csvData, setCsvData] = useState("");
  const [uploading, setUploading] = useState(false);

  const fetchReferrals = async () => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (statusFilter && statusFilter !== "all") params.set("status", statusFilter);
    const res = await fetch(`/api/reseller/referrals?${params}`);
    const data = await res.json();
    setReferrals(data.referrals || []);
    setLoading(false);
  };

  useEffect(() => { fetchReferrals(); }, [search, statusFilter]);

  const handleCSVUpload = async () => {
    if (!csvData.trim()) {
      toast.error("Please paste CSV data");
      return;
    }
    setUploading(true);
    try {
      const res = await fetch("/api/reseller/referrals/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ csvData }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error);
        return;
      }
      toast.success(`Imported ${data.imported} referrals. ${data.skipped} skipped.`);
      if (data.errors?.length > 0) {
        data.errors.slice(0, 3).forEach((e: { row: number; message: string }) => {
          toast.error(`Row ${e.row}: ${e.message}`);
        });
      }
      setCsvDialog(false);
      setCsvData("");
      fetchReferrals();
    } catch {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">My Referrals</h1>
        <div className="flex gap-2">
          <Dialog open={csvDialog} onOpenChange={setCsvDialog}>
            <DialogTrigger asChild>
              <Button variant="outline"><Upload className="mr-2 h-4 w-4" /> Bulk Upload</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Bulk Upload Referrals</DialogTitle>
                <DialogDescription>
                  Paste CSV data with headers: companyName, contactName, contactEmail, contactPhone, productInterest, estimatedValue, notes
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="rounded-md bg-muted p-3">
                  <p className="text-xs font-mono text-muted-foreground">
                    companyName,contactName,contactEmail,contactPhone,productInterest,estimatedValue,notes<br />
                    Acme Inc,John Doe,john@acme.com,+1-555-0100,ENTERPRISE,50000,Hot lead
                  </p>
                </div>
                <Textarea
                  value={csvData}
                  onChange={(e) => setCsvData(e.target.value)}
                  placeholder="Paste CSV data here..."
                  rows={10}
                  className="font-mono text-sm"
                />
              </div>
              <DialogFooter>
                <Button onClick={handleCSVUpload} disabled={uploading}>
                  {uploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Upload
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Button asChild>
            <Link href="/reseller/referrals/new"><PlusCircle className="mr-2 h-4 w-4" /> New Referral</Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search referrals..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[160px]"><SelectValue placeholder="All Statuses" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
          ) : referrals.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">No referrals found.</p>
              <Button asChild><Link href="/reseller/referrals/new">Submit Your First Referral</Link></Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Company</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Commission</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {referrals.map((ref) => (
                    <TableRow key={ref.id}>
                      <TableCell className="font-medium">{ref.companyName}</TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm">{ref.contactName}</p>
                          <p className="text-xs text-muted-foreground">{ref.contactEmail}</p>
                        </div>
                      </TableCell>
                      <TableCell><Badge variant="secondary">{ref.productInterest}</Badge></TableCell>
                      <TableCell>
                        {ref.dealValue ? fc(Number(ref.dealValue)) :
                         ref.estimatedValue ? `~${fc(Number(ref.estimatedValue))}` : "-"}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={STATUS_COLORS[ref.status]}>{ref.status}</Badge>
                      </TableCell>
                      <TableCell>
                        {ref.commission ? (
                          <div>
                            <span className="text-sm font-semibold">${Number(ref.commission.commissionAmount).toLocaleString()}</span>
                            <Badge variant="outline" className="ml-2 text-xs">{ref.commission.status}</Badge>
                          </div>
                        ) : "-"}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{format(new Date(ref.createdAt), "MMM d, yy")}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
