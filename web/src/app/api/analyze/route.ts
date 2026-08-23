import { NextRequest, NextResponse } from "next/server";
import { spawn } from "child_process";
import path from "path";

export const runtime = "nodejs";

// The Python ML project lives as a sibling directory to this Next.js app:
//   project/
//     ml/    <- dataset generation, training, predict.py, models/
//     web/   <- this Next.js app
// predict.py resolves its own "models/..." paths relative to its own
// directory, so we run it with cwd set there.
const ML_DIR = path.join(process.cwd(), "..", "ml");
// Point directly to the virtual environment's Python executable
const PYTHON_BIN = process.env.PYTHON_BIN || path.join(ML_DIR, "venv", "bin", "python3");
type AnalyzeRequestBody = {
  reviewText?: string;
  productName?: string;
  productType?: string;
};

function runPredict(input: object): Promise<Record<string, unknown>> {
  return new Promise((resolve, reject) => {
    const child = spawn(PYTHON_BIN, ["predict.py"], { cwd: ML_DIR });

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (chunk) => (stdout += chunk.toString()));
    child.stderr.on("data", (chunk) => (stderr += chunk.toString()));

    child.on("error", (err) => {
      reject(new Error(`Failed to start Python process: ${err.message}`));
    });

    child.on("close", (code) => {
      if (code !== 0 && !stdout.trim()) {
        reject(new Error(stderr || `Python process exited with code ${code}`));
        return;
      }
      try {
        resolve(JSON.parse(stdout.trim().split("\n").pop() || "{}"));
      } catch {
        reject(new Error(`Could not parse model output: ${stdout} ${stderr}`));
      }
    });

    child.stdin.write(JSON.stringify(input));
    child.stdin.end();
  });
}

export async function POST(req: NextRequest) {
  let body: AnalyzeRequestBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const reviewText = (body.reviewText || "").trim();
  if (!reviewText) {
    return NextResponse.json({ error: "reviewText is required" }, { status: 400 });
  }
  if (reviewText.split(/\s+/).length < 3) {
    return NextResponse.json(
      { error: "Please enter a longer review (at least a few words) for a meaningful analysis." },
      { status: 400 }
    );
  }

  try {
    const result = await runPredict({
      reviewText,
      productName: body.productName || "",
      productType: body.productType || "",
    });

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (err) {
    console.error("Prediction error:", err);
    return NextResponse.json(
      {
        error:
          "The model service didn't respond. Make sure the Python environment is set up and " +
          "`python3 train.py` has been run inside the ml/ folder to generate models/*.pkl. " +
          "See the README for setup steps.",
      },
      { status: 500 }
    );
  }
}
