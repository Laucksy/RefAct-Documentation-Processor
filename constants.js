export const TIME_PERIODS = ['Pre-Arrival', 'Day of Arrival', 'First Day Post-Arrival', 'First Week Post-Arrival']

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
\\tikzstyle{decision} = [diamond, draw, fill=blue!20, text width=4.5em, text badly centered, node distance=3cm, inner sep=0pt]
\\tikzstyle{block} = [rectangle, draw, fill=blue!20, text width=10em, text centered, rounded corners, minimum height=4em]
\\tikzstyle{line} = [thick,->,>=stealth]
\\tikzstyle{cloud} = [draw, ellipse,fill=red!20, node distance=3cm, minimum height=2em]

\\begin{center}
\\begin{tikzpicture}[node distance = 2cm, auto]`

export const TIMELINE_FOOTER = `\\end{tikzpicture}
\\end{center}
\\end{document}`
