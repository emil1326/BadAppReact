type CaptchaCodeProps = {
  svgMarkup: string;
  className?: string;
};

/**
 * Renders an SVG captcha returned verbatim from the backend (svg-captcha).
 * The markup is trusted because it's generated server-side from a fixed
 * digit charset — no user input is interpolated into it.
 */
export function CaptchaCode({ svgMarkup, className }: CaptchaCodeProps) {
  return (
    <div
      className={className}
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: svgMarkup }}
    />
  );
}
