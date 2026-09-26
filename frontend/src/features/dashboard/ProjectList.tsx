import { useState } from "react";
import { PenLine } from "lucide-react";
import { useProjects, type Project } from "../../api/projects";
import Alert from "../../components/Alert";
import Button from "../../components/Button";
import DeleteProjectDialog from "./DeleteProjectDialog";
import ProjectCard from "./ProjectCard";
import ProjectSkeleton from "./ProjectSkeleton";

type ProjectListProps = {
  onStartNew: () => void;
};

export default function ProjectList({ onStartNew }: ProjectListProps) {
  const projects = useProjects();
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);

  return (
    <section aria-labelledby="projects-heading">
      <div className="flex items-baseline justify-between">
        <h2 id="projects-heading" className="text-sm font-semibold">
          Your projects
        </h2>
        {projects.data && projects.data.length > 0 && (
          <span className="text-xs text-muted">
            {projects.data.length} {projects.data.length === 1 ? "project" : "projects"}
          </span>
        )}
      </div>

      <div className="mt-4">
        {projects.isPending && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3" role="status" aria-label="Loading your projects">
            <ProjectSkeleton />
            <ProjectSkeleton />
            <ProjectSkeleton />
          </div>
        )}

        {projects.isError && (
          <div className="space-y-3">
            <Alert>We couldn't load your projects. {projects.error.message}</Alert>
            <Button variant="secondary" onClick={() => projects.refetch()}>
              Try again
            </Button>
          </div>
        )}

        {projects.data?.length === 0 && (
          <div className="flex flex-col items-center rounded-lg border border-dashed border-line px-6 py-10 text-center">
            <p className="text-sm font-medium">No projects yet</p>
            <p className="mt-1 max-w-sm text-sm text-muted">
              Describe what you want to build in the box above, or start from one of the templates below.
            </p>
            <Button variant="secondary" onClick={onStartNew} className="mt-4">
              <PenLine className="h-4 w-4" aria-hidden />
              Describe your first app
            </Button>
          </div>
        )}

        {projects.data && projects.data.length > 0 && (
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {projects.data.map((project) => (
              <li key={project.id}>
                <ProjectCard project={project} onDelete={setProjectToDelete} />
              </li>
            ))}
          </ul>
        )}
      </div>

      {projectToDelete && (
        <DeleteProjectDialog project={projectToDelete} onClose={() => setProjectToDelete(null)} />
      )}
    </section>
  );
}
