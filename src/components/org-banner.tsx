import {
  ORG_LOGO_ALT,
  SITE_FULL,
  SITE_PHOTO_ALT,
  SITE_PHOTO_CARD,
  SITE_SHORT,
} from "@/lib/report/paper";

export function OrgBanner({ photo = false }: { photo?: boolean }) {
  return (
    <div className="bg-uls text-uls-fg">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-2.5 sm:px-6 lg:gap-6 lg:px-8 lg:py-3">
        <div className="flex min-w-0 items-center gap-3 sm:gap-4">
          <span
            className="h-10 w-px shrink-0 bg-uls-fg sm:h-11 lg:h-12"
            aria-hidden
          />
          <p className="min-w-0 font-sans leading-[1.05]">
            <span className="sr-only">{ORG_LOGO_ALT}</span>
            <span className="block text-[0.7rem] font-semibold uppercase tracking-[0.16em] sm:text-xs">
              Unidade Local de Saúde
            </span>
            <span className="mt-0.5 block text-[1.65rem] font-bold uppercase tracking-[0.12em] sm:text-[1.85rem] lg:text-[2rem]">
              Oeste
            </span>
          </p>
        </div>

        <div className="ml-auto min-w-0 text-right">
          <p className="truncate text-base font-semibold sm:text-lg">{SITE_SHORT}</p>
          <p className="hidden truncate text-xs text-uls-fg/85 sm:block">
            {SITE_FULL}
          </p>
        </div>

        {photo ? (
          <img
            src={SITE_PHOTO_CARD}
            alt={SITE_PHOTO_ALT}
            className="site-photo hidden h-12 w-[4.75rem] shrink-0 rounded-md object-cover object-[42%_62%] ring-1 ring-uls-fg/35 sm:block lg:h-14 lg:w-24"
          />
        ) : null}
      </div>
    </div>
  );
}
