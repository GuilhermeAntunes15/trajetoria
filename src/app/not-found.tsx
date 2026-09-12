import { Illustration } from "@/components/common/Illustration";
import { rotateStyle } from "@/components/common/decor";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { errors } from "@/lib/copy";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center px-4 text-center">
      <Illustration name="magnifier" className="h-28 w-auto sm:h-32" />

      <p
        className="lp-sticker lp-sticker-flat mt-6 bg-lp-sun px-4 py-2 text-sm font-bold text-ink"
        style={rotateStyle(-2)}
      >
        {errors.notFoundSticker}
      </p>

      <h1 className="mt-6 font-display text-[1.75rem] leading-tight font-bold text-ink sm:text-4xl">
        {errors.notFound}
      </h1>
      <p className="mt-2 text-sm text-muted sm:text-base">{errors.notFoundText}</p>

      <ButtonLink href="/" className="mt-7">
        {errors.backHome}
      </ButtonLink>
    </div>
  );
}
