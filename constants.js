export const TIME_PERIODS = ['Pre-Notification', 'Pre-Arrival', 'Day of Arrival', 'First Day Post-Arrival', 'First Week Post-Arrival', 'First Month Post-Arrival', 'First 3 Months Post-Arrival', 'First 6 Months Post-Arrival']

export const REPORT_HEADER = `\\documentclass{report}
\\usepackage[utf8]{inputenc}
\\usepackage[margin=1in]{geometry}
\\setlength{\\parindent}{0cm}

\\title{Refugee Action Documentation}
\\author{Erik Laucks}
\\date{\\today}

\\newcommand{\\tab}{\\null\\qquad}

\\begin{document}

\\maketitle

\\tableofcontents
\\newpage`

export const REPORT_FOOTER = '\\end{document}'

// \\tikzstyle{line} = [draw, -latex']
export const TIMELINE_HEADER = `\\documentclass{article}
\\usepackage[utf8]{inputenc}
\\usepackage[margin=0.5in]{geometry}
\\usepackage{tikz}
\\usetikzlibrary{shapes,arrows}
\\usetikzlibrary{positioning}
\\begin{document}
\\pagestyle{empty}

% Define block styles
\\tikzstyle{block} = [rectangle, draw, fill=blue!20, text width=4cm, text centered, rounded corners, minimum height=4em]
\\tikzstyle{line} = [thick,->,>=stealth]

\\begin{center}`

export const TIMELINE_FOOTER = `\\end{center}
\\end{document}`
