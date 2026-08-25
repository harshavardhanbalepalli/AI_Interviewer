import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { decodeToken } from "@/lib/utils";

const EMPTY_FORM = { title: "", description: "", skills: "" };

function JDForm({ form, setForm, onSubmit, onCancel, submitLabel }) {
  return (
    <div className="space-y-4">
      <div>
        <Label className="mb-2 block">Title</Label>
        <Input
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className="h-12 rounded-xl border-gray-300 focus:border-orange-500"
          placeholder="e.g. Backend Engineer"
        />
      </div>

      <div>
        <Label className="mb-2 block">Description</Label>
        <textarea
          rows={4}
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="w-full rounded-xl border border-gray-300 focus:border-orange-500 focus:outline-none p-3 text-base"
          placeholder="Role responsibilities and expectations"
        />
      </div>

      <div>
        <Label className="mb-2 block">Skills (comma separated)</Label>
        <Input
          value={form.skills}
          onChange={(e) => setForm({ ...form, skills: e.target.value })}
          className="h-12 rounded-xl border-gray-300 focus:border-orange-500"
          placeholder="e.g. Python, SQL, FastAPI"
        />
      </div>

      <div className="flex gap-3">
        <Button
          onClick={onSubmit}
          className="rounded-xl bg-orange-500 hover:bg-orange-600"
        >
          {submitLabel}
        </Button>

        <Button variant="outline" onClick={onCancel} className="rounded-xl">
          Cancel
        </Button>
      </div>
    </div>
  );
}

function AdminManageJDs() {
  const token = localStorage.getItem("token");
  const companyId = decodeToken(token)?.company_id;

  const [jds, setJds] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createForm, setCreateForm] = useState(EMPTY_FORM);

  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(EMPTY_FORM);

  const [deleteTarget, setDeleteTarget] = useState(null);

  const loadJds = () => {
    fetch("http://127.0.0.1:8000/admin/jd")
      .then((response) => response.json())
      .then((data) => {
        const mine = Array.isArray(data)
          ? data.filter((jd) => jd.company_id === companyId)
          : [];
        setJds(mine);
        setLoading(false);
      })
      .catch((error) => {
        console.error(error);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadJds();
  }, []);

  const createJd = async () => {
    await fetch("http://127.0.0.1:8000/admin/jd", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(createForm),
    });

    setCreateForm(EMPTY_FORM);
    setShowCreateForm(false);
    loadJds();
  };

  const startEdit = (jd) => {
    setEditingId(jd.id);
    setEditForm({
      title: jd.title,
      description: jd.description,
      skills: jd.skills,
    });
  };

  const saveEdit = async (id) => {
    await fetch(`http://127.0.0.1:8000/admin/jd/${id}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(editForm),
    });

    setEditingId(null);
    loadJds();
  };

  const confirmDelete = async () => {
    await fetch(`http://127.0.0.1:8000/admin/jd/${deleteTarget}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    setDeleteTarget(null);
    loadJds();
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-5xl mx-auto px-8 py-12">
        <Link
          to="/admin"
          className="text-orange-500 font-semibold hover:text-orange-600"
        >
          &larr; Back to Dashboard
        </Link>

        <div className="flex items-center justify-between mt-4">
          <div>
            <h1 className="text-4xl font-bold text-slate-900">
              Job Descriptions
            </h1>

            <p className="mt-2 text-slate-500">
              Create and manage postings for your company.
            </p>
          </div>

          {!showCreateForm && (
            <Button
              onClick={() => setShowCreateForm(true)}
              className="rounded-xl bg-orange-500 hover:bg-orange-600"
            >
              + New Job Description
            </Button>
          )}
        </div>

        {showCreateForm && (
          <div className="mt-8 bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
            <h3 className="font-semibold text-slate-800 mb-4">
              New Job Description
            </h3>

            <JDForm
              form={createForm}
              setForm={setCreateForm}
              onSubmit={createJd}
              onCancel={() => {
                setShowCreateForm(false);
                setCreateForm(EMPTY_FORM);
              }}
              submitLabel="Create"
            />
          </div>
        )}

        {loading && <p className="mt-12 text-slate-500">Loading...</p>}

        {!loading && jds.length === 0 && (
          <div className="mt-12 bg-white rounded-3xl border border-slate-200 p-12 text-center">
            <p className="text-slate-500 text-lg">
              No job descriptions yet.
            </p>
          </div>
        )}

        <div className="space-y-6 mt-8">
          {jds.map((jd) => (
            <div
              key={jd.id}
              className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8"
            >
              {editingId === jd.id ? (
                <JDForm
                  form={editForm}
                  setForm={setEditForm}
                  onSubmit={() => saveEdit(jd.id)}
                  onCancel={() => setEditingId(null)}
                  submitLabel="Save"
                />
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-slate-900">
                      {jd.title}
                    </h2>

                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        className="rounded-xl"
                        onClick={() => startEdit(jd)}
                      >
                        Edit
                      </Button>

                      <Button
                        variant="destructive"
                        className="rounded-xl"
                        onClick={() => setDeleteTarget(jd.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>

                  <p className="mt-4 text-slate-600 leading-7">
                    {jd.description}
                  </p>

                  <div className="mt-6 flex flex-wrap gap-2">
                    {jd.skills.split(",").map((skill, index) => (
                      <span
                        key={index}
                        className="bg-orange-50 text-orange-600 px-3 py-1 rounded-full text-sm"
                      >
                        {skill.trim()}
                      </span>
                    ))}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      <Dialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Job Description?</DialogTitle>

            <DialogDescription>
              This cannot be undone. Candidates will no longer be able to see
              or apply to this posting.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>

            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default AdminManageJDs;
