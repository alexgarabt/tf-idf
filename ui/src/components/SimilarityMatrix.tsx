import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface SimilarityMatrixProps {
  matrix: number[][];
  labels: string[];
}

function cellColor(value: number): string {
  // Interpolate from light (0) to saturated green (1)
  const h = 142;
  const s = 40 + value * 30;
  const l = 95 - value * 50;
  return `hsl(${h}, ${s}%, ${l}%)`;
}

export function SimilarityMatrix({ matrix, labels }: SimilarityMatrixProps) {
  if (matrix.length < 2) {
    return (
      <p className="text-muted-foreground text-center text-sm py-8">
        Upload at least 2 documents to see the similarity matrix.
      </p>
    );
  }

  const maxLabelLen = 12;
  const truncate = (s: string) =>
    s.length > maxLabelLen ? s.slice(0, maxLabelLen) + "..." : s;

  return (
    <div className="overflow-auto">
      <table className="border-collapse text-xs">
        <thead>
          <tr>
            <th className="p-2" />
            {labels.map((label) => (
              <th
                key={label}
                className="p-2 font-medium text-muted-foreground max-w-20 truncate"
                title={label}
              >
                {truncate(label)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {matrix.map((row, i) => (
            <tr key={labels[i]}>
              <td
                className="p-2 font-medium text-muted-foreground text-right max-w-20 truncate"
                title={labels[i]}
              >
                {truncate(labels[i]!)}
              </td>
              {row.map((value, j) => (
                <td key={j} className="p-0">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div
                        className={`w-12 h-12 flex items-center justify-center text-xs font-mono cursor-default transition-transform hover:scale-110 ${
                          i === j ? "font-bold" : ""
                        }`}
                        style={{
                          backgroundColor: cellColor(value),
                          color: value > 0.6 ? "white" : "inherit",
                        }}
                      >
                        {value.toFixed(2)}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>
                        {labels[i]} &harr; {labels[j]}: {value.toFixed(4)}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
