type CaptchaCodeProps = {
  svgMarkup: string;
  className?: string;
};

export function CaptchaCode({ svgMarkup, className }: CaptchaCodeProps) {
  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: svgMarkup }}
    />
  );
}
