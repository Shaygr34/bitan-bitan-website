/**
 * Header placeholder — M1 scaffold.
 * Full sticky navbar with navigation, logo, and mobile hamburger
 * will be implemented in M4.
 */
export function Header() {
  return (
    <header className="h-[72px] bg-white border-b border-border flex items-center px-6 md:h-[72px] h-[56px]">
      <div className="max-w-content mx-auto w-full flex items-center justify-between">
        {/* Logo — right side (RTL: first in DOM = right) */}
        <div className="text-primary font-bold text-h4">
          ביטן את ביטן
          <span className="text-text-muted font-normal text-body-sm mr-2">
            {" "}
            רואי חשבון
          </span>
        </div>

        {/* Nav placeholder — will be implemented in M4 */}
        <nav className="hidden md:flex items-center gap-6 text-nav text-primary">
          <span className="opacity-50">ניווט יתווסף ב-M4</span>
        </nav>
      </div>
    </header>
  );
}
