from fpdf import FPDF

pdf = FPDF()
pdf.add_page()
pdf.set_font("Arial", size=12)

with open("c:\\Users\\NC\\Desktop\\ai-study-assistant\\test-document.txt", "r") as f:
    for line in f:
        pdf.cell(200, 10, txt=line.strip(), ln=True)

pdf.output("c:\\Users\\NC\\Desktop\\ai-study-assistant\\test-document.pdf")