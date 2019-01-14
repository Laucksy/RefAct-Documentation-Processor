export const TIME_PERIODS = ['Pre-Arrival', 'Day of Arrival', 'First Day Post-Arrival', 'First Week Post-Arrival']

export const REPORT_HEADER = `\\documentclass{report}
\\usepackage[utf8]{inputenc}
\\usepackage[margin=1in]{geometry}

\\title{Refugee Action Documentation}
\\author{Erik Laucks}
\\date{\\today}

\\newcommand{\\tab}{\\null\\qquad}

\\begin{document}

\\maketitle

\\tableofcontents
\\newpage`

export const FOOTER = '\\end{document}'
