import { Fragment, type ReactNode } from "react";
import { Link } from "react-router-dom";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/shared/components/ui/breadcrumb";

interface Crumb {
  label: string;
  to: string;
}

interface PageHeaderProps {
  title: ReactNode;
  description?: ReactNode;
  /** O caminho de volta nas telas de detalhe: as telas acima e o nome desta. */
  breadcrumb?: { parents: Crumb[]; current: string };
  /** Os botões da página, no canto direito. */
  actions?: ReactNode;
  /** O que fica logo abaixo do título, como as abas. */
  children?: ReactNode;
}

/** O cabeçalho de toda tela: título, descrição, ações à direita e as abas embaixo. */
export function PageHeader({ title, description, breadcrumb, actions, children }: PageHeaderProps) {
  return (
    <header className="flex flex-col gap-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          {/* Caminho de volta */}
          {breadcrumb && (
            <Breadcrumb className="mb-1.5">
              <BreadcrumbList>
                {breadcrumb.parents.map((crumb) => (
                  <Fragment key={crumb.to}>
                    <BreadcrumbItem>
                      <BreadcrumbLink render={<Link to={crumb.to} />}>{crumb.label}</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                  </Fragment>
                ))}
                <BreadcrumbItem>
                  <BreadcrumbPage>{breadcrumb.current}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          )}
          <h1 className="text-page-title flex flex-wrap items-center gap-2">{title}</h1>
          {description && <p className="text-ink-2 mt-1 max-w-2xl">{description}</p>}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
      {children}
    </header>
  );
}
