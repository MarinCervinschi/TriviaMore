import Link from "next/link";
import { FaHome } from "react-icons/fa";
interface BreadcrumbProps {
  pages: string[];
  url?: string;
}
const Breadcrumb = ({ pages, url }: BreadcrumbProps) => {
  return (
    <nav className="container mx-auto mb-6">
      <ol className="flex items-center gap-2">
        <li>
          <Link className="font-medium hover:text-accent hover:underline underline-offset-4 flex items-center gap-2" href="/">
            <FaHome /> {`Home >`}
          </Link>
        </li>
        {
          pages.map((name, index) => (
            <li key={index} className={`font-medium ${index === pages.length - 1 ? 'text-secondary' : ''}`}>
              {index < pages.length - 1 && url ? (
                <Link href={url} className="hover:text-accent hover:underline underline-offset-4">
                  {name.toLocaleLowerCase()} {`>`}
                </Link>
              ) : (
                <span className="text-secondary">
                  {name.toLocaleLowerCase()}
                </span>
              )}
            </li>
          ))
        }
      </ol>
    </nav>
  );
};

export default Breadcrumb;
