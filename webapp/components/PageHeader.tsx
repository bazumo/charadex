import Link from "next/link";

interface PageHeaderProps {
  backUrl?: string;
  backText?: string;
}

export default function PageHeader({
  backUrl = "/",
  backText = "← Back"
}: PageHeaderProps) {
  return (
    <header className="w-full bg-white dark:bg-black z-20 py-8 border-b border-gray-200 dark:border-gray-800">
      <div className="px-8">
        <Link
          href={backUrl}
          className="inline-block text-gray-600 hover:text-black dark:text-gray-400 dark:hover:text-white transition-colors"
        >
          {backText}
        </Link>
      </div>
    </header>
  );
}
