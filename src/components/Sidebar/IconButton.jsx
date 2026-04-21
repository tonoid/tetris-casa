export default function IconButton(props) {
  const { icon: IconCmp, label, title, active = false, danger = false, onClick } = props;
  const classes = ['icon-btn'];
  if (active) classes.push('active');
  if (danger) classes.push('danger');

  return (
    <button
      type="button"
      className={classes.join(' ')}
      onClick={onClick}
      title={title ?? label}
      aria-label={title ?? label}
      aria-pressed={active}
    >
      <span className="icon-slot" aria-hidden="true">
        <IconCmp />
      </span>
      <span className="icon-label">{label}</span>
    </button>
  );
}
