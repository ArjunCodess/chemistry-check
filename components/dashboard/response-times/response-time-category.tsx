interface ResponseTimeCategoryProps {
  name: string;
  range: string;
  description: string;
  bgColor: string;
  borderColor: string;
}

export function ResponseTimeCategory({
  name,
  range,
  description,
  bgColor,
  borderColor,
}: ResponseTimeCategoryProps) {
  return (
    <div className={`${bgColor} rounded-lg p-3 border ${borderColor}`}>
      <div className="text-xs font-medium text-muted-foreground uppercase">
        {name}
      </div>
      <div className="text-xl font-semibold mt-1">{range}</div>
      <div className="text-xs text-muted-foreground mt-1">{description}</div>
    </div>
  );
} 