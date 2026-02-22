#!/usr/bin/env python3
"""Generate blog images using Google Gemini Imagen API.

Generates 70 images for 15 blog articles and saves them as optimized WebP files.
Usage: GEMINI_API_KEY=... python scripts/generate-blog-images.py
"""

import os
import sys
import time
import re
from pathlib import Path
from io import BytesIO

from google import genai
from PIL import Image

# --- Config ---
API_KEY = os.environ.get("GEMINI_API_KEY", "")
if not API_KEY:
    print("ERROR: Set GEMINI_API_KEY environment variable")
    sys.exit(1)

client = genai.Client(api_key=API_KEY)

PROJECT_ROOT = Path(__file__).resolve().parent.parent
PUBLIC_DIR = PROJECT_ROOT / "public"

# Target dimensions: 16:10 aspect ratio, optimized for web
TARGET_WIDTH = 1200
TARGET_HEIGHT = 750
WEBP_QUALITY = 82

# Rate limiting
DELAY_BETWEEN_REQUESTS = 4  # seconds

# All 70 images: (path_relative_to_public, prompt)
IMAGES = [
    # --- Article 1: how-to-recreate-sweater-from-photo ---
    (
        "images/blog/how-to-recreate-sweater-from-photo/photo-to-pattern-process-overview.webp",
        "Clean infographic diagram showing the process of converting a sweater photo into a knitting pattern. Left side shows a camera icon with a photo of a cozy sweater, middle shows measurement inputs with body silhouette and ruler, right side shows a printed knitting pattern with stitch symbols. Arrows connect each step. Soft pastel colors, minimal clean design, white background, professional illustration style."
    ),
    (
        "images/blog/how-to-recreate-sweater-from-photo/gauge-swatch-measurement.webp",
        "Close-up photograph of a hand-knitted gauge swatch in cream wool yarn on a wooden table, with a small metal ruler placed across it measuring stitches per inch. The swatch shows neat stockinette stitch. Warm natural lighting, shallow depth of field, cozy craft atmosphere."
    ),
    (
        "images/blog/how-to-recreate-sweater-from-photo/sweater-construction-types.webp",
        "Technical illustration showing three sweater construction types side by side: raglan (with diagonal seam lines from underarm to neck), set-in sleeve (with curved armhole), and drop shoulder (with straight shoulder line). Each labeled clearly. Clean line drawing style with soft blue and gray tones, white background."
    ),
    (
        "images/blog/how-to-recreate-sweater-from-photo/good-vs-bad-source-photo.webp",
        "Side-by-side comparison showing two photos of the same hand-knit sweater. Left side labeled 'Good': well-lit, clear, front-facing sweater photo on clean background showing stitch detail. Right side labeled 'Poor': dark, blurry, angled photo where stitch pattern is hard to see. Clean layout with dividing line."
    ),
    # --- Article 2: photo-to-knitting-pattern-complete-guide ---
    (
        "images/blog/photo-to-knitting-pattern-complete-guide/sweater-construction-analysis.webp",
        "Annotated photograph of a hand-knit sweater laid flat, with clean overlay arrows and labels pointing to: seam lines, neckline shape (crew neck), sleeve attachment point, ribbing at hem and cuffs. Soft warm tones, craft photography style, educational diagram overlay."
    ),
    (
        "images/blog/photo-to-knitting-pattern-complete-guide/common-stitch-patterns-grid.webp",
        "Grid of six close-up knitting stitch pattern swatches: stockinette (smooth V-shapes), garter (horizontal ridges), 2x2 ribbing (vertical columns), simple cable, seed stitch, and Fair Isle colorwork. Each swatch labeled underneath. Natural wool yarn in neutral tones, clean grid layout."
    ),
    (
        "images/blog/photo-to-knitting-pattern-complete-guide/body-measurements-diagram.webp",
        "Clean illustration of a human figure outline (front view) with labeled measurement lines: bust circumference, waist circumference, hip circumference, shoulder width, arm length from shoulder to wrist, and body length from shoulder to hip. Minimal style with soft teal measurement lines on white background."
    ),
    (
        "images/blog/photo-to-knitting-pattern-complete-guide/pattern-calculation-example.webp",
        "Clean infographic showing a knitting gauge calculation: '40 inch bust x 5 stitches per inch = 200 stitches to cast on'. Illustrated with a small gauge swatch icon, a multiplication symbol, and the result in a highlighted box. Minimal design, soft colors, educational style."
    ),
    (
        "images/blog/photo-to-knitting-pattern-complete-guide/la-maille-pattern-generation-flow.webp",
        "Clean four-step workflow diagram for an AI knitting pattern generator: Step 1 camera icon 'Upload Photo', Step 2 ruler icon 'Enter Measurements', Step 3 yarn icon 'Input Gauge', Step 4 document icon 'Get Pattern'. Connected by arrows, soft gradient background in warm pastel tones, modern UI illustration style."
    ),
    # --- Article 3: ai-knitting-pattern-generator-vs-traditional ---
    (
        "images/blog/ai-knitting-pattern-generator-vs-traditional/traditional-vs-ai-pattern-design.webp",
        "Split image: left side shows traditional knitting pattern design with graph paper, calculator, pencil and hand-written notes on a wooden desk. Right side shows a modern laptop screen displaying a digital knitting pattern interface. Clean dividing line down the middle. Warm cozy lighting on left, bright modern lighting on right."
    ),
    (
        "images/blog/ai-knitting-pattern-generator-vs-traditional/pattern-modification-spreadsheet.webp",
        "Overhead photograph of a knitting pattern worksheet on a wooden desk, showing handwritten gauge calculations, stitch count tables, and measurement notes. A calculator, pencil, and small gauge swatch sit beside it. Warm natural lighting, craft workspace atmosphere."
    ),
    (
        "images/blog/ai-knitting-pattern-generator-vs-traditional/ai-pattern-generation-steps.webp",
        "Clean infographic showing four sequential steps with icons: 1. Upload photo (camera icon), 2. Enter measurements (ruler icon), 3. Input gauge (grid icon), 4. Receive pattern (document with checkmark). Connected by arrows. Modern minimal design, soft gradient background, professional illustration."
    ),
    (
        "images/blog/ai-knitting-pattern-generator-vs-traditional/comparison-table-visual.webp",
        "Clean visual comparison table with two columns: 'Traditional' and 'AI-Generated'. Rows compare: Time (hours vs minutes), Skill needed (advanced vs beginner-friendly), Customization (manual vs automatic), Cost (free vs tool cost). Icons for each row. Soft colors, modern infographic style."
    ),
    # --- Article 4: understanding-knitting-gauge-complete-guide ---
    (
        "images/blog/understanding-knitting-gauge-complete-guide/gauge-impact-sweater-size.webp",
        "Three identical sweater silhouettes side by side in different sizes, showing how a half-stitch gauge difference changes the finished size by 4 inches. Left sweater slightly smaller, middle correct size, right larger. Each labeled with gauge and resulting size. Clean illustration, soft pastel tones."
    ),
    (
        "images/blog/understanding-knitting-gauge-complete-guide/gauge-swatch-knitting-steps.webp",
        "Four-panel step-by-step illustration of making a gauge swatch: 1. Casting on stitches with yarn and needles, 2. Knitting stockinette rows, 3. Binding off the last row, 4. Blocking the finished swatch flat with pins. Clean instructional style, warm yarn colors, white background."
    ),
    (
        "images/blog/understanding-knitting-gauge-complete-guide/measuring-gauge-correctly.webp",
        "Close-up photograph of a knitted gauge swatch in light blue wool with a small ruler placed in the center of the fabric, measuring 4 inches across. Pins mark the measurement area. Clear focus on the center stitches avoiding edge distortion. Warm natural lighting."
    ),
    (
        "images/blog/understanding-knitting-gauge-complete-guide/gauge-troubleshooting-needles.webp",
        "Clean illustration showing three knitting needle sizes side by side with their resulting swatches: smaller needle (tighter fabric, more stitches per inch), correct needle (perfect gauge), larger needle (looser fabric, fewer stitches per inch). Each labeled. Minimal educational diagram style."
    ),
    (
        "images/blog/understanding-knitting-gauge-complete-guide/stitch-pattern-gauge-differences.webp",
        "Three gauge swatches side by side showing different stitch patterns: stockinette stitch, 2x2 ribbing (compressed width), and cable pattern (also compressed width). Each with the same ruler showing different stitch counts per inch. Clean photography on white background, neutral yarn."
    ),
    # --- Article 5: how-to-identify-knitting-stitches-from-photos ---
    (
        "images/blog/how-to-identify-knitting-stitches-from-photos/knit-vs-purl-stitch-closeup.webp",
        "Extreme close-up of knitted fabric showing two sections: left side displays the smooth V-shaped knit stitches (stockinette front), right side shows the bumpy purl stitches (stockinette back). Each side labeled. Cream colored yarn, sharp macro photography, educational."
    ),
    (
        "images/blog/how-to-identify-knitting-stitches-from-photos/stockinette-garter-comparison.webp",
        "Side-by-side close-up of two knitted swatches: left shows stockinette stitch (smooth interlocking V columns), right shows garter stitch (horizontal ridges). Both in the same cream yarn. Clean dividing line, each labeled underneath. Macro knitting photography."
    ),
    (
        "images/blog/how-to-identify-knitting-stitches-from-photos/ribbing-types-1x1-2x2.webp",
        "Two knitted swatches side by side showing ribbing patterns: left shows 1x1 ribbing (alternating single knit and purl columns), right shows 2x2 ribbing (pairs of knit and purl columns). Both in natural cream wool, showing the characteristic vertical stretch. Clean photography."
    ),
    (
        "images/blog/how-to-identify-knitting-stitches-from-photos/cable-knitting-examples.webp",
        "Four small knitted swatches showing cable patterns of increasing complexity: simple 2-stitch twist, basic 6-stitch cable, braided cable, and honeycomb cable pattern. Arranged in a row on white background, all in cream Aran-weight yarn. Clean craft photography."
    ),
    (
        "images/blog/how-to-identify-knitting-stitches-from-photos/colorwork-types-stranded-intarsia.webp",
        "Two knitted colorwork swatches side by side: left shows stranded Fair Isle colorwork with small repeating geometric motifs in two colors, right shows intarsia with larger blocks of solid color. Both flipped to show the back (stranded has floats, intarsia has clean back). Educational layout."
    ),
    # --- Article 6: how-to-measure-yourself-for-knitted-sweater ---
    (
        "images/blog/how-to-measure-yourself-for-knitted-sweater/sweater-measurements-diagram-front.webp",
        "Clean front-view illustration of a human figure with measurement lines showing: bust circumference (horizontal line at chest), waist circumference (at natural waist), hip circumference (at widest hip), and shoulder width (across shoulders). Each line labeled with the measurement name. Minimal style, soft teal lines on white background."
    ),
    (
        "images/blog/how-to-measure-yourself-for-knitted-sweater/bust-measurement-technique.webp",
        "Photograph demonstrating correct bust measurement technique: a person holding a soft tape measure around the fullest part of the bust, keeping the tape parallel to the floor. Clean background, clear demonstration of proper tape placement. Warm natural lighting."
    ),
    (
        "images/blog/how-to-measure-yourself-for-knitted-sweater/sweater-measurements-diagram-side.webp",
        "Clean side-view illustration of a human figure showing: arm length measurement from shoulder point to wrist, and body length from shoulder to desired hem. Dotted lines show each measurement path. Minimal style, soft teal measurement lines on white background."
    ),
    (
        "images/blog/how-to-measure-yourself-for-knitted-sweater/common-measurement-mistakes.webp",
        "Split illustration showing measurement mistakes: left side shows incorrect measurement over bulky clothing (labeled 'Wrong'), right side shows correct measurement close to body over thin layer (labeled 'Correct'). Clean comparison diagram, educational style."
    ),
    (
        "images/blog/how-to-measure-yourself-for-knitted-sweater/ease-comparison-fitted-oversized.webp",
        "Two sweater silhouettes on the same body form: left shows a close-fitting sweater with 2 inches of ease (labeled 'Fitted'), right shows a relaxed oversized sweater with 6 inches of ease (labeled 'Oversized'). Clean illustration showing the difference in drape and fit."
    ),
    # --- Article 7: raglan-vs-set-in-sleeves-which-to-choose ---
    (
        "images/blog/raglan-vs-set-in-sleeves-which-to-choose/raglan-vs-setin-construction-diagram.webp",
        "Technical diagram showing two sweater construction methods side by side: left shows raglan with diagonal seam lines from underarm to neckline, right shows set-in sleeve with curved armhole seam. Clean line drawing with construction lines highlighted in contrasting color. White background."
    ),
    (
        "images/blog/raglan-vs-set-in-sleeves-which-to-choose/raglan-sleeve-sweater-example.webp",
        "Photograph of a hand-knit raglan sweater laid flat, clearly showing the characteristic diagonal seam lines running from each underarm up to the neckline. Simple stockinette in a warm heather gray yarn. Clean background, craft photography."
    ),
    (
        "images/blog/raglan-vs-set-in-sleeves-which-to-choose/setin-sleeve-sweater-example.webp",
        "Photograph of a hand-knit set-in sleeve sweater laid flat, showing the tailored shoulder line and curved armhole seam where sleeve meets body. Classic construction in a navy blue wool yarn. Clean background, craft photography."
    ),
    (
        "images/blog/raglan-vs-set-in-sleeves-which-to-choose/drop-shoulder-construction.webp",
        "Photograph of a hand-knit drop shoulder sweater laid flat, showing how the straight body edge extends past the shoulder and the sleeve attaches below the shoulder point. Relaxed casual fit in a chunky oatmeal yarn. Clean background."
    ),
    (
        "images/blog/raglan-vs-set-in-sleeves-which-to-choose/body-type-sleeve-choice-guide.webp",
        "Illustrated guide showing three body silhouettes with recommended sleeve types: narrow shoulders with raglan (adds visual width), broad shoulders with set-in (defines the shoulder), and average build with drop shoulder (casual ease). Clean diagram with labels."
    ),
    # --- Article 8: how-to-resize-knitting-pattern ---
    (
        "images/blog/how-to-resize-knitting-pattern/pattern-resize-calculation.webp",
        "Clean infographic showing the basic resizing formula: 'Desired inches x Stitches per inch = Stitches needed'. Illustrated with an example: 40 inches x 5 st/in = 200 stitches. Simple icons for ruler, gauge swatch, and result. Soft colors, minimal design."
    ),
    (
        "images/blog/how-to-resize-knitting-pattern/body-width-adjustment-diagram.webp",
        "Sweater pattern schematic showing original size overlaid with adjusted size. Original outline in gray, new larger outline in teal with updated stitch counts at key points (bust, waist, hip). Clean technical drawing style, labeled measurements."
    ),
    (
        "images/blog/how-to-resize-knitting-pattern/waist-shaping-recalculation.webp",
        "Diagram showing sweater front with waist shaping: arrows indicate decrease points at sides. Numbers show original stitch count at bust and recalculated count at waist, with the number of decrease rows. Clean schematic illustration style."
    ),
    (
        "images/blog/how-to-resize-knitting-pattern/sleeve-increase-calculation.webp",
        "Illustration of a sleeve shape from cuff to upper arm, showing how increases are distributed evenly along the length. Labeled: cuff stitches at bottom, upper arm stitches at top, with increase markers shown at regular intervals. Clean technical diagram."
    ),
    (
        "images/blog/how-to-resize-knitting-pattern/grading-between-sizes.webp",
        "Pattern schematic showing three overlapping sweater outlines for sizes S, M, and L, demonstrating how measurements grade up proportionally between sizes. Each size in a different soft color. Clean technical illustration."
    ),
    # --- Article 9: top-down-vs-bottom-up-sweaters ---
    (
        "images/blog/top-down-vs-bottom-up-sweaters/topdown-vs-bottomup-direction.webp",
        "Clean diagram showing two sweater silhouettes side by side: left sweater has a downward arrow from neckline to hem labeled 'Top-Down', right sweater has an upward arrow from hem to shoulders labeled 'Bottom-Up'. Minimal illustration, soft colors, educational."
    ),
    (
        "images/blog/top-down-vs-bottom-up-sweaters/topdown-construction-stages.webp",
        "Three-stage progression of a top-down sweater being knitted: Stage 1 shows just the yoke (small triangle), Stage 2 shows yoke with body separated from sleeves, Stage 3 shows the completed sweater. Clean illustration showing the growth of the garment. Warm yarn colors."
    ),
    (
        "images/blog/top-down-vs-bottom-up-sweaters/tryon-topdown-advantage.webp",
        "Illustration of a knitter trying on an in-progress top-down sweater, with circular needles still attached at the body. The sweater is partially completed showing the yoke and beginning of the body. Demonstrates the try-on advantage. Warm cozy illustration style."
    ),
    (
        "images/blog/top-down-vs-bottom-up-sweaters/bottomup-pieces-before-seaming.webp",
        "Flat-lay photograph of four hand-knit sweater pieces before assembly: front panel, back panel, and two sleeves, arranged neatly on a clean surface. All pieces in matching heather wool, showing how bottom-up construction creates separate pieces to be seamed together."
    ),
    # --- Article 10: what-is-ease-in-knitting ---
    (
        "images/blog/what-is-ease-in-knitting/ease-diagram-body-vs-garment.webp",
        "Clean diagram showing a body silhouette (inner outline) with a garment outline around it (outer outline). The space between is labeled 'Ease'. Measurements shown: body = 36 inches, garment = 40 inches, ease = 4 inches. Minimal illustration style with soft colors."
    ),
    (
        "images/blog/what-is-ease-in-knitting/ease-amounts-visual-comparison.webp",
        "Four sweater silhouettes on the same body form showing different amounts of ease: 0 inches (skin-tight), 2 inches (fitted), 4 inches (standard), 6 inches (oversized). Each labeled with ease amount. Clean comparison illustration, same color sweater, different fits."
    ),
    (
        "images/blog/what-is-ease-in-knitting/negative-ease-ribbing-example.webp",
        "Close-up photograph of a ribbed knit garment being worn, showing how the ribbing stretches to fit the body with negative ease. The fabric is slightly stretched, showing the elastic nature of ribbing. Warm tones, clean background."
    ),
    (
        "images/blog/what-is-ease-in-knitting/pattern-ease-calculation.webp",
        "Clean infographic showing a pattern size chart with body measurements and finished garment measurements side by side. Highlighted difference between them shows the ease built into the pattern. Example: Size M body bust 36, finished bust 40, ease 4 inches. Educational diagram."
    ),
    # --- Article 11: how-to-knit-sweater-that-fits ---
    (
        "images/blog/how-to-knit-sweater-that-fits/sweater-fit-problems-examples.webp",
        "Three sweater illustrations showing common fit problems: left shows too tight across the bust (fabric pulling), center shows shoulders too wide (drooping shoulder seams), right shows body too long (excess fabric at hem). Each problem labeled. Clean educational illustration."
    ),
    (
        "images/blog/how-to-knit-sweater-that-fits/measurement-checklist-visual.webp",
        "Clean checklist graphic showing all measurements needed for sweater fitting: bust, waist, hip, shoulder width, arm length, body length, upper arm, wrist. Each with a small icon and checkbox. Organized in a neat grid layout, soft colors, modern design."
    ),
    (
        "images/blog/how-to-knit-sweater-that-fits/finished-vs-body-measurements.webp",
        "Side-by-side comparison: left shows a body measurement schematic (actual body dimensions), right shows a pattern finished measurements schematic (larger, including ease). Arrows point out the differences. Clean technical illustration style."
    ),
    (
        "images/blog/how-to-knit-sweater-that-fits/short-row-bust-shaping.webp",
        "Technical diagram of a sweater front showing short row placement for a full bust adjustment. Highlighted area shows where extra rows are added across the bust, with arrows indicating the short row turning points. Clean schematic illustration."
    ),
    (
        "images/blog/how-to-knit-sweater-that-fits/topdown-tryon-fit-check.webp",
        "Illustration of a knitter trying on a top-down sweater in progress at the yoke stage, checking shoulder width and bust fit. Circular needles visible with live stitches. Warm cozy illustration style showing the fitting process."
    ),
    # --- Article 12: best-yarn-for-first-sweater ---
    (
        "images/blog/best-yarn-for-first-sweater/yarn-weight-comparison.webp",
        "Five yarn strands arranged horizontally from thin to thick: fingering, sport, DK, worsted, and bulky weight. Each labeled with weight name and typical gauge. Clean white background, natural wool colors ranging from cream to warm brown. Photography style."
    ),
    (
        "images/blog/best-yarn-for-first-sweater/wool-swatch-blocking-before-after.webp",
        "Before and after comparison of a wool knitting swatch: left shows the unblocked swatch (slightly uneven stitches, curling edges), right shows the same swatch after blocking (flat, even stitches, neat edges). Both pinned to a blocking mat. Craft photography."
    ),
    (
        "images/blog/best-yarn-for-first-sweater/yarn-color-stitch-visibility.webp",
        "Three identical knitted swatches in the same cable stitch pattern: left in light cream (stitches very visible), center in medium teal (stitches moderately visible), right in dark charcoal (stitches barely visible). Clean photography showing stitch definition differences."
    ),
    (
        "images/blog/best-yarn-for-first-sweater/recommended-beginner-yarns.webp",
        "Flat-lay photograph of four skeins of beginner-friendly yarn arranged neatly: a light worsted wool, a DK superwash merino, a chunky wool blend, and an aran weight yarn. All in pleasant neutral to pastel colors. Clean white background, craft photography."
    ),
    # --- Article 13: how-to-read-knitting-pattern-beginners ---
    (
        "images/blog/how-to-read-knitting-pattern-beginners/pattern-anatomy-labeled.webp",
        "Illustration of a knitting pattern page with labeled sections: gauge information (top), materials list, size options, abbreviations key, row-by-row instructions, and schematic diagram. Arrows point to each section with clear labels. Educational diagram, clean layout."
    ),
    (
        "images/blog/how-to-read-knitting-pattern-beginners/abbreviations-cheat-sheet.webp",
        "Visual cheat sheet showing common knitting abbreviations with small illustrations: K (knit - V shape), P (purl - bump), YO (yarn over - hole), K2tog (two stitches becoming one leaning right), SSK (two becoming one leaning left), PM (place marker). Clean grid layout, educational."
    ),
    (
        "images/blog/how-to-read-knitting-pattern-beginners/parentheses-size-highlighting.webp",
        "Example knitting pattern text showing multiple sizes in parentheses: 'Cast on 80 (88, 96, 104, 112) sts'. One size highlighted in yellow to show how to track your size through the pattern. Clean typography, educational illustration."
    ),
    (
        "images/blog/how-to-read-knitting-pattern-beginners/knitting-chart-reading-direction.webp",
        "Knitting chart diagram with arrows showing reading direction: RS (right side) rows read right-to-left, WS (wrong side) rows read left-to-right. Row numbers on the side. Clean chart symbols for knit, purl, and yarn over. Educational diagram with clear directional arrows."
    ),
    (
        "images/blog/how-to-read-knitting-pattern-beginners/pattern-row-decode-example.webp",
        "A single knitting pattern row instruction broken down step by step: 'K2, *P1, K3; rep from * to last 2 sts, K2'. Each part highlighted in different colors with annotations explaining what each element means. Clean educational typography layout."
    ),
    # --- Article 14: common-sweater-knitting-mistakes-and-fixes ---
    (
        "images/blog/common-sweater-knitting-mistakes-and-fixes/dropped-stitch-ladder-fix.webp",
        "Three-step illustration showing how to fix a dropped stitch with a crochet hook: Step 1 shows the dropped stitch creating a ladder, Step 2 shows inserting a crochet hook to catch the stitch, Step 3 shows the repaired fabric. Clean instructional diagram, close-up view."
    ),
    (
        "images/blog/common-sweater-knitting-mistakes-and-fixes/twisted-stitch-comparison.webp",
        "Extreme close-up comparison: left shows a correctly mounted stitch on the needle (right leg in front), right shows a twisted stitch on the needle (left leg in front). Both clearly labeled. Clean macro photography or illustration of stitches on knitting needle."
    ),
    (
        "images/blog/common-sweater-knitting-mistakes-and-fixes/accidental-yarnover-identification.webp",
        "Close-up of knitted stockinette fabric showing an accidental yarn over: a small unwanted hole in an otherwise smooth fabric. Arrow points to the extra stitch. Clean macro photography, neutral colored yarn, educational annotation."
    ),
    (
        "images/blog/common-sweater-knitting-mistakes-and-fixes/twisted-join-mobius-problem.webp",
        "Illustration showing circular knitting gone wrong: left shows a correctly joined round (flat circle of stitches), right shows a twisted join creating a mobius strip (stitches twisted once before joining). Clean diagram with labels, educational."
    ),
    (
        "images/blog/common-sweater-knitting-mistakes-and-fixes/lifeline-placement-technique.webp",
        "Close-up photograph or illustration of knitting on circular needles with a thin contrasting thread (lifeline) woven through a row of stitches below the needles. The lifeline is clearly visible in a bright color against neutral yarn. Educational craft photography."
    ),
    # --- Article 15: how-to-adapt-knitting-pattern-to-your-size ---
    (
        "images/blog/how-to-adapt-knitting-pattern-to-your-size/pattern-adaptation-workflow.webp",
        "Flowchart diagram with four connected steps: 'Measure Your Body' (ruler icon) -> 'Compare to Pattern' (document icon) -> 'Calculate Changes' (calculator icon) -> 'Document Modifications' (notebook icon). Clean modern flowchart style, soft pastel colors, arrows connecting steps."
    ),
    (
        "images/blog/how-to-adapt-knitting-pattern-to-your-size/length-adjustment-diagram.webp",
        "Sweater schematic showing where to add or remove rows for length modifications: arrows point to the area between hem ribbing and armhole where extra rows can be added. 'Add rows here' label with plus signs. Clean technical illustration."
    ),
    (
        "images/blog/how-to-adapt-knitting-pattern-to-your-size/width-adjustment-calculation.webp",
        "Before and after stitch count comparison: left shows original pattern stitch counts at bust, waist, and hip. Right shows recalculated counts for a different size. Arrows show the proportional changes. Clean infographic style."
    ),
    (
        "images/blog/how-to-adapt-knitting-pattern-to-your-size/size-blending-schematic.webp",
        "Sweater pattern schematic with different body sections highlighted in different colors: bust area in blue (following Size M), waist in green (following Size S), hips in orange (following Size L). Shows how to blend multiple sizes. Clean technical illustration."
    ),
    (
        "images/blog/how-to-adapt-knitting-pattern-to-your-size/modification-notes-template.webp",
        "Clean photograph of a knitting modification notebook page showing organized notes: original pattern numbers crossed out with new calculations written beside them. Sections for bust, waist, sleeve, and length changes. Neat handwriting on graph paper, pencil nearby."
    ),
]


def generate_and_save_image(prompt: str, output_path: Path) -> bool:
    """Generate an image using Gemini Imagen and save as WebP."""
    if output_path.exists():
        print(f"  SKIP (exists): {output_path.relative_to(PUBLIC_DIR)}")
        return True

    try:
        # Use Gemini 2.5 Flash with image generation
        from google.genai import types

        response = client.models.generate_content(
            model="gemini-2.5-flash-image",
            contents=f"Generate an image: {prompt}",
            config=types.GenerateContentConfig(
                response_modalities=["IMAGE", "TEXT"],
            ),
        )

        # Extract image from response parts
        img = None
        for part in response.candidates[0].content.parts:
            if part.inline_data and part.inline_data.mime_type.startswith("image/"):
                img = Image.open(BytesIO(part.inline_data.data))
                break

        if img is None:
            print(f"  FAIL (no image in response): {output_path.name}")
            return False

        # Resize to target dimensions
        img = img.resize((TARGET_WIDTH, TARGET_HEIGHT), Image.LANCZOS)

        # Save as WebP
        output_path.parent.mkdir(parents=True, exist_ok=True)
        img.save(str(output_path), "WEBP", quality=WEBP_QUALITY, method=6)

        size_kb = output_path.stat().st_size / 1024
        print(f"  OK ({size_kb:.0f}KB): {output_path.relative_to(PUBLIC_DIR)}")
        return True

    except Exception as e:
        print(f"  FAIL: {output_path.name} — {e}")
        return False


def main():
    print(f"Generating {len(IMAGES)} blog images with Gemini Imagen...")
    print(f"Output: {PUBLIC_DIR}/images/blog/")
    print()

    success = 0
    failed = 0
    skipped = 0

    for i, (rel_path, prompt) in enumerate(IMAGES, 1):
        output_path = PUBLIC_DIR / rel_path
        print(f"[{i}/{len(IMAGES)}] {rel_path}")

        if output_path.exists():
            skipped += 1
            print(f"  SKIP (exists)")
            continue

        if generate_and_save_image(prompt, output_path):
            success += 1
        else:
            failed += 1

        # Rate limit
        if i < len(IMAGES):
            time.sleep(DELAY_BETWEEN_REQUESTS)

    print()
    print(f"Done! Generated: {success}, Skipped: {skipped}, Failed: {failed}")
    print(f"Total images in place: {success + skipped}/{len(IMAGES)}")


if __name__ == "__main__":
    main()
