const SPLINE_BACKGROUND_URL =
  "https://my.spline.design/claritystream-bcax5ruD3QjxxwdEpZElZyGK/";

function SplineBackground({ className = "" }) {
  const classes = ["spline-page-background", className].filter(Boolean).join(" ");

  return (
    <div className={classes} aria-hidden="true">
      <iframe
        src={SPLINE_BACKGROUND_URL}
        title="SkillFlow ambient background"
        frameBorder="0"
        width="100%"
        height="100%"
        loading="eager"
        tabIndex={-1}
      />
    </div>
  );
}

export default SplineBackground;
