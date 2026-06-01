const ROBOT_SCENE_URL =
  "https://my.spline.design/nexbotrobotcharacterconceptforpersonaluse-YRFigT6bdVJ0Qgl2G6myxuRz/";

function Robot({ className = "" }) {
  const classes = ["robot-scene", className].filter(Boolean).join(" ");

  return (
    <div className={classes} aria-label="SkillFlow robot assistant">
      <iframe
        src={ROBOT_SCENE_URL}
        title="SkillFlow robot assistant"
        frameBorder="0"
        width="100%"
        height="100%"
        loading="eager"
      />
    </div>
  );
}

export default Robot;
