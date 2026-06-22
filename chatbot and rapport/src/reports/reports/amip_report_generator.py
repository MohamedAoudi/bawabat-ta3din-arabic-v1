"""
AMIP — Smart Minerals PDF Report Generator.

Legacy entry point kept for backward compatibility. The implementation now
lives in:
  * ``src.reports.data``      — SQL + Pydantic models
  * ``src.reports.insights``  — narrative rules + flag rules
  * ``src.reports.i18n``      — translations + locale-aware formatters
  * ``src.reports.pdf``       — ReportLab rendering
"""

from src.reports.data import get_report_data, get_report_payload  # noqa: F401
from src.reports.pdf.builder import (  # noqa: F401
    generate_report,
    generate_reports_all_languages,
    render_pdf,
)


if __name__ == "__main__":
    import os
    out_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "outputs")
    os.makedirs(out_dir, exist_ok=True)
    generate_report(
        os.path.join(out_dir, "AMIP_Phosphate_Morocco_Report.pdf"),
        country="Morocco", mineral="Phosphate",
        year_from=2019, year_to=2023, lang="en",
    )
