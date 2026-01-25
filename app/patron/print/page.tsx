"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useLaMailleStore } from "@/lib/store";
import {
  GARMENT_TYPE_LABELS,
  CONSTRUCTION_METHOD_LABELS,
  YARN_WEIGHT_LABELS,
} from "@/lib/types";

export default function PrintPatternPage() {
  const router = useRouter();
  const { pattern, hasPattern } = useLaMailleStore();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!hasPattern()) {
      router.replace("/");
      return;
    }

    // Attendre que le contenu soit rendu
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 100);

    return () => clearTimeout(timer);
  }, [hasPattern, router]);

  // Lancer l'impression automatiquement une fois prêt
  useEffect(() => {
    if (isReady && pattern) {
      const printTimer = setTimeout(() => {
        window.print();
      }, 300);

      return () => clearTimeout(printTimer);
    }
  }, [isReady, pattern]);

  if (!pattern) {
    return (
      <div className="p-8 text-center">
        <p>Chargement...</p>
      </div>
    );
  }

  const garmentTypeLabel = GARMENT_TYPE_LABELS[pattern.analysis.garment.type];
  const createdDate = new Date(pattern.createdAt).toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const calculatedWidth = Math.round(
    pattern.measurements.chestCircumference + pattern.measurements.ease
  );

  return (
    <div className="print-document">
      <style jsx global>{`
        @media screen {
          body {
            background: #f5f5f5;
          }
          .print-document {
            max-width: 210mm;
            margin: 20px auto;
            background: white;
            padding: 20mm;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          }
        }

        @media print {
          @page {
            size: A4;
            margin: 15mm 20mm;
          }

          body {
            font-size: 11pt;
            line-height: 1.4;
            color: #000;
            background: #fff;
          }

          .print-document {
            padding: 0;
          }

          .page-break {
            page-break-before: always;
          }

          .avoid-break {
            page-break-inside: avoid;
          }

          .no-print {
            display: none !important;
          }
        }

        .print-document {
          font-family: Georgia, "Times New Roman", serif;
          color: #1a1a1a;
        }

        .print-document h1 {
          font-size: 28pt;
          margin-bottom: 8px;
        }

        .print-document h2 {
          font-size: 16pt;
          margin-top: 24px;
          margin-bottom: 12px;
          border-bottom: 1px solid #ddd;
          padding-bottom: 6px;
        }

        .print-document h3 {
          font-size: 13pt;
          margin-top: 16px;
          margin-bottom: 8px;
        }

        .print-document p,
        .print-document li {
          font-size: 11pt;
          line-height: 1.5;
        }

        .print-document .mono {
          font-family: "Courier New", monospace;
          font-size: 10pt;
        }

        .print-document .muted {
          color: #666;
        }

        .print-document .warning-box {
          border: 2px solid #b45309;
          background: #fef3c7;
          padding: 12px 16px;
          margin: 16px 0;
        }

        .print-document .info-box {
          border: 1px solid #ddd;
          background: #f9f9f9;
          padding: 12px 16px;
          margin: 12px 0;
        }

        .print-document table {
          width: 100%;
          border-collapse: collapse;
          margin: 12px 0;
        }

        .print-document th,
        .print-document td {
          text-align: left;
          padding: 8px 12px;
          border-bottom: 1px solid #ddd;
        }

        .print-document th {
          font-weight: 600;
          background: #f5f5f5;
        }

        .print-document ul,
        .print-document ol {
          padding-left: 24px;
          margin: 8px 0;
        }

        .print-document li {
          margin: 4px 0;
        }

        .print-document .instruction-block {
          background: #fafafa;
          border-left: 3px solid #333;
          padding: 12px 16px;
          margin: 12px 0;
        }

        .print-document .instruction-block .rows {
          font-size: 10pt;
          color: #666;
          margin-bottom: 4px;
        }
      `}</style>

      {/* COUVERTURE */}
      <div className="text-center avoid-break" style={{ paddingTop: "60px", paddingBottom: "60px" }}>
        <h1>LA MAILLE</h1>
        <p className="muted" style={{ fontSize: "14pt" }}>
          De la photo au tricot
        </p>

        <div style={{ margin: "48px 0" }}>
          <h2 style={{ border: "none", fontSize: "24pt" }}>{garmentTypeLabel}</h2>
          <p className="muted">
            {CONSTRUCTION_METHOD_LABELS[pattern.analysis.construction.method]}
          </p>
        </div>

        <table style={{ maxWidth: "400px", margin: "0 auto" }}>
          <tbody>
            <tr>
              <td className="muted">Tour de poitrine fini</td>
              <td className="mono">{calculatedWidth} cm</td>
            </tr>
            <tr>
              <td className="muted">Echantillon</td>
              <td className="mono">
                {pattern.gauge.stitchesPer10cm} m x {pattern.gauge.rowsPer10cm} r
                / 10 cm
              </td>
            </tr>
            <tr>
              <td className="muted">Aiguilles</td>
              <td className="mono">{pattern.gauge.needleSize} mm</td>
            </tr>
            <tr>
              <td className="muted">Fil</td>
              <td>{YARN_WEIGHT_LABELS[pattern.yarn.weight]}</td>
            </tr>
          </tbody>
        </table>

        <p className="muted" style={{ marginTop: "48px" }}>
          Genere le {createdDate}
        </p>

        <div className="warning-box" style={{ maxWidth: "400px", margin: "32px auto 0" }}>
          <p style={{ margin: 0, fontWeight: 600 }}>
            Ce patron est une estimation automatique.
          </p>
          <p className="muted" style={{ margin: "4px 0 0", fontSize: "10pt" }}>
            Verifiez vos calculs et tricotez un echantillon avant de commencer.
          </p>
        </div>
      </div>

      {/* MATERIEL */}
      <div className="page-break">
        <h2>Materiel necessaire</h2>

        <table>
          <tbody>
            <tr>
              <th style={{ width: "140px" }}>Fil</th>
              <td>
                <strong>{YARN_WEIGHT_LABELS[pattern.yarn.weight]}</strong>
                {pattern.yarn.composition && ` - ${pattern.yarn.composition}`}
                <span className="muted">
                  {" "}
                  - estimation{" "}
                  <span className="mono">
                    {Math.round(pattern.estimatedYardage * 0.9)}-
                    {Math.round(pattern.estimatedYardage * 1.1)}
                  </span>{" "}
                  g
                </span>
              </td>
            </tr>
            <tr>
              <th>Aiguilles</th>
              <td>
                <strong className="mono">{pattern.gauge.needleSize} mm</strong> -
                circulaires 80 cm minimum
              </td>
            </tr>
            <tr>
              <th>Accessoires</th>
              <td>Aiguille a laine, marqueurs, ciseaux</td>
            </tr>
            {pattern.analysis.closure.type === "boutons" && (
              <tr>
                <th>Boutons</th>
                <td>
                  <strong className="mono">
                    {pattern.analysis.closure.buttonCountEstimate || 5}
                  </strong>{" "}
                  boutons d&apos;environ 1.5-2 cm
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="info-box">
          <p style={{ margin: 0 }}>
            <strong>Echantillon requis :</strong>{" "}
            <span className="mono">
              {pattern.gauge.stitchesPer10cm} mailles x {pattern.gauge.rowsPer10cm}{" "}
              rangs
            </span>{" "}
            pour 10 cm, en jersey, avec les aiguilles{" "}
            <span className="mono">{pattern.gauge.needleSize} mm</span>.
          </p>
          <p className="muted" style={{ margin: "8px 0 0", fontSize: "10pt" }}>
            Lavez et bloquez votre echantillon avant de mesurer.
          </p>
        </div>
      </div>

      {/* PIECES DU PATRON */}
      {pattern.pieces.map((piece, pieceIndex) => (
        <div key={pieceIndex} className={pieceIndex > 0 ? "page-break" : ""}>
          <h2>{piece.name}</h2>

          {piece.castOn > 0 && (
            <p>
              <strong>Montage :</strong>{" "}
              <span className="mono">{piece.castOn}</span> mailles
              {piece.totalRows > 0 && (
                <>
                  {" "}
                  | <strong>Rangs :</strong> ~
                  <span className="mono">{piece.totalRows}</span>
                </>
              )}
            </p>
          )}

          {piece.instructions.map((instruction, instrIndex) => (
            <div key={instrIndex} className="instruction-block avoid-break">
              {instruction.rowStart > 0 && (
                <div className="rows">
                  Rang{instruction.rowStart !== instruction.rowEnd ? "s" : ""}{" "}
                  {instruction.rowStart}
                  {instruction.rowEnd !== instruction.rowStart &&
                    ` - ${instruction.rowEnd}`}
                </div>
              )}
              <p style={{ margin: 0 }}>{instruction.text}</p>
              {instruction.notes && (
                <p className="muted" style={{ margin: "8px 0 0", fontSize: "10pt" }}>
                  Note : {instruction.notes}
                </p>
              )}
            </div>
          ))}

          {piece.warnings.length > 0 && (
            <div className="info-box">
              <ul style={{ margin: 0, paddingLeft: 16 }}>
                {piece.warnings.map((warning, i) => (
                  <li key={i}>{warning}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ))}

      {/* ASSEMBLAGE */}
      <div className="page-break">
        <h2>Assemblage</h2>
        <ol>
          {pattern.assembly.map((step, i) => (
            <li key={i}>{step.replace(/^\d+\.\s*/, "")}</li>
          ))}
        </ol>
      </div>

      {/* FINITIONS */}
      <div className="avoid-break">
        <h2>Finitions</h2>
        <ul>
          {pattern.finishing.map((step, i) => (
            <li key={i}>{step.replace(/^-\s*/, "")}</li>
          ))}
        </ul>
      </div>

      {/* LIMITATIONS */}
      {pattern.analysis.limitations.length > 0 && (
        <div className="avoid-break">
          <h2>Limitations de l&apos;analyse</h2>
          <div className="warning-box">
            <ul style={{ margin: 0, paddingLeft: 16 }}>
              {pattern.analysis.limitations.map((limitation, i) => (
                <li key={i}>{limitation}</li>
              ))}
            </ul>
            <p className="muted" style={{ margin: "12px 0 0", fontSize: "10pt" }}>
              Ces elements necessitent votre jugement ou la consultation d&apos;un
              patron dedie.
            </p>
          </div>
        </div>
      )}

      {/* DISCLAIMER */}
      <div className="avoid-break" style={{ marginTop: "32px" }}>
        <div className="info-box">
          <p className="muted" style={{ margin: 0, fontSize: "10pt", whiteSpace: "pre-line" }}>
            {pattern.disclaimer}
          </p>
        </div>
      </div>

      {/* FOOTER */}
      <div
        style={{
          marginTop: "48px",
          paddingTop: "16px",
          borderTop: "1px solid #ddd",
          textAlign: "center",
        }}
      >
        <p className="muted" style={{ margin: 0, fontSize: "9pt" }}>
          La Maille - lamaille.fr - Patron genere automatiquement
        </p>
      </div>

      {/* Bouton retour (non imprime) */}
      <div
        className="no-print"
        style={{ marginTop: "32px", textAlign: "center" }}
      >
        <button
          onClick={() => router.back()}
          style={{
            padding: "12px 24px",
            fontSize: "14px",
            cursor: "pointer",
            border: "1px solid #ddd",
            background: "#fff",
            borderRadius: "6px",
          }}
        >
          Retour au patron
        </button>
      </div>
    </div>
  );
}
