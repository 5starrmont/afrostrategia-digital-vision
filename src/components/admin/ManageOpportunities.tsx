import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { Plus, Pencil, Trash2, Briefcase } from 'lucide-react';
import { format } from 'date-fns';

interface Opportunity {
  id: string;
  title: string;
  type: 'job' | 'internship' | 'attachment';
  department_id: string | null;
  location: string | null;
  employment_type: string | null;
  description: string;
  requirements: string | null;
  responsibilities: string | null;
  application_deadline: string | null;
  application_email: string | null;
  application_url: string | null;
  is_active: boolean;
  created_at: string;
  department?: { name: string } | null;
}

interface Department {
  id: string;
  name: string;
}

const ManageOpportunities = () => {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingOpp, setEditingOpp] = useState<Opportunity | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    type: 'job' as 'job' | 'internship' | 'attachment',
    department_id: '',
    location: '',
    employment_type: '',
    description: '',
    requirements: '',
    responsibilities: '',
    application_deadline: '',
    application_email: '',
    application_url: '',
    is_active: true
  });

  useEffect(() => {
    fetchOpportunities();
    fetchDepartments();
  }, []);

  const fetchOpportunities = async () => {
    const { data, error } = await supabase
      .from('opportunities')
      .select('*, department:departments(name)')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setOpportunities(data as unknown as Opportunity[]);
    }
    setLoading(false);
  };

  const fetchDepartments = async () => {
    const { data, error } = await supabase
      .from('departments')
      .select('id, name')
      .order('name');

    if (!error && data) {
      setDepartments(data);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      type: 'job',
      department_id: '',
      location: '',
      employment_type: '',
      description: '',
      requirements: '',
      responsibilities: '',
      application_deadline: '',
      application_email: '',
      application_url: '',
      is_active: true
    });
    setEditingOpp(null);
  };

  const handleEdit = (opp: Opportunity) => {
    setEditingOpp(opp);
    setFormData({
      title: opp.title,
      type: opp.type,
      department_id: opp.department_id || '',
      location: opp.location || '',
      employment_type: opp.employment_type || '',
      description: opp.description,
      requirements: opp.requirements || '',
      responsibilities: opp.responsibilities || '',
      application_deadline: opp.application_deadline ? opp.application_deadline.split('T')[0] : '',
      application_email: opp.application_email || '',
      application_url: opp.application_url || '',
      is_active: opp.is_active
    });
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      title: formData.title,
      type: formData.type,
      department_id: formData.department_id || null,
      location: formData.location || null,
      employment_type: formData.employment_type || null,
      description: formData.description,
      requirements: formData.requirements || null,
      responsibilities: formData.responsibilities || null,
      application_deadline: formData.application_deadline || null,
      application_email: formData.application_email || null,
      application_url: formData.application_url || null,
      is_active: formData.is_active
    };

    if (editingOpp) {
      const { error } = await supabase
        .from('opportunities')
        .update(payload)
        .eq('id', editingOpp.id);

      if (error) {
        toast({ title: 'Error updating opportunity', description: error.message, variant: 'destructive' });
      } else {
        toast({ title: 'Opportunity updated successfully' });
        setDialogOpen(false);
        resetForm();
        fetchOpportunities();
      }
    } else {
      const { error } = await supabase
        .from('opportunities')
        .insert(payload);

      if (error) {
        toast({ title: 'Error creating opportunity', description: error.message, variant: 'destructive' });
      } else {
        toast({ title: 'Opportunity created successfully' });
        setDialogOpen(false);
        resetForm();
        fetchOpportunities();
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this opportunity?')) return;

    const { error } = await supabase
      .from('opportunities')
      .delete()
      .eq('id', id);

    if (error) {
      toast({ title: 'Error deleting opportunity', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Opportunity deleted successfully' });
      fetchOpportunities();
    }
  };

  const toggleActive = async (id: string, isActive: boolean) => {
    const { error } = await supabase
      .from('opportunities')
      .update({ is_active: !isActive })
      .eq('id', id);

    if (error) {
      toast({ title: 'Error updating status', description: error.message, variant: 'destructive' });
    } else {
      setOpportunities(prev => prev.map(o => o.id === id ? { ...o, is_active: !isActive } : o));
      toast({ title: `Opportunity ${!isActive ? 'activated' : 'deactivated'}` });
    }
  };

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'job': return 'bg-primary/10 text-primary';
      case 'internship': return 'bg-blue-500/10 text-blue-600';
      case 'attachment': return 'bg-purple-500/10 text-purple-600';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Manage Opportunities</h2>
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Opportunity
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingOpp ? 'Edit Opportunity' : 'Create New Opportunity'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="type">Type *</Label>
                  <Select value={formData.type} onValueChange={(v: 'job' | 'internship' | 'attachment') => setFormData({ ...formData, type: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="job">Job</SelectItem>
                      <SelectItem value="internship">Internship</SelectItem>
                      <SelectItem value="attachment">Attachment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="employment_type">Employment Type</Label>
                  <Select value={formData.employment_type} onValueChange={v => setFormData({ ...formData, employment_type: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full-time">Full Time</SelectItem>
                      <SelectItem value="part-time">Part Time</SelectItem>
                      <SelectItem value="contract">Contract</SelectItem>
                      <SelectItem value="remote">Remote</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="department">Department</Label>
                  <Select value={formData.department_id} onValueChange={v => setFormData({ ...formData, department_id: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map(dept => (
                        <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={e => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g., Nairobi, Kenya"
                  />
                </div>

                <div className="col-span-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    required
                  />
                </div>

                <div className="col-span-2">
                  <Label htmlFor="requirements">Requirements</Label>
                  <Textarea
                    id="requirements"
                    value={formData.requirements}
                    onChange={e => setFormData({ ...formData, requirements: e.target.value })}
                    rows={3}
                    placeholder="List requirements, one per line"
                  />
                </div>

                <div className="col-span-2">
                  <Label htmlFor="responsibilities">Responsibilities</Label>
                  <Textarea
                    id="responsibilities"
                    value={formData.responsibilities}
                    onChange={e => setFormData({ ...formData, responsibilities: e.target.value })}
                    rows={3}
                    placeholder="List responsibilities, one per line"
                  />
                </div>

                <div>
                  <Label htmlFor="deadline">Application Deadline</Label>
                  <Input
                    id="deadline"
                    type="date"
                    value={formData.application_deadline}
                    onChange={e => setFormData({ ...formData, application_deadline: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="email">Application Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.application_email}
                    onChange={e => setFormData({ ...formData, application_email: e.target.value })}
                    placeholder="careers@example.com"
                  />
                </div>

                <div className="col-span-2">
                  <Label htmlFor="url">Application URL</Label>
                  <Input
                    id="url"
                    type="url"
                    value={formData.application_url}
                    onChange={e => setFormData({ ...formData, application_url: e.target.value })}
                    placeholder="https://..."
                  />
                </div>

                <div className="col-span-2 flex items-center space-x-2">
                  <Switch
                    id="active"
                    checked={formData.is_active}
                    onCheckedChange={checked => setFormData({ ...formData, is_active: checked })}
                  />
                  <Label htmlFor="active">Active (visible to public)</Label>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingOpp ? 'Update' : 'Create'} Opportunity
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {opportunities.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Briefcase className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">No Opportunities Yet</h3>
            <p className="text-muted-foreground mb-4">Create your first job, internship, or attachment posting.</p>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Opportunity
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {opportunities.map(opp => (
                  <TableRow key={opp.id}>
                    <TableCell className="font-medium">{opp.title}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getTypeBadgeColor(opp.type)}>
                        {opp.type.charAt(0).toUpperCase() + opp.type.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>{opp.department?.name || '-'}</TableCell>
                    <TableCell>
                      <Switch
                        checked={opp.is_active}
                        onCheckedChange={() => toggleActive(opp.id, opp.is_active)}
                      />
                    </TableCell>
                    <TableCell>{format(new Date(opp.created_at), 'MMM d, yyyy')}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleEdit(opp)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDelete(opp.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ManageOpportunities;
