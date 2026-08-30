import sys
import os
import json
import qrcode
from PIL import Image, ImageDraw, ImageFont
import arabic_reshaper
from bidi.algorithm import get_display
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from reportlab.lib.utils import ImageReader

def shape_text(text):
    if not text:
        return ""
    try:
        reshaped = arabic_reshaper.reshape(text)
        bidi_text = get_display(reshaped)
        return bidi_text
    except Exception:
        return text

def create_invitation_pdf(data_json_path, output_pdf_path):
    with open(data_json_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    full_name = data.get("fullName", "")
    id_number = data.get("idNumber", "")
    ticket_type = data.get("ticketType", "")
    qr_code = data.get("qrCode", "")
    seat_number = data.get("seatNumber", "")
    logo_path = data.get("logoPath", "")

    ticket_labels = {
        "student": "خريج / طالب",
        "guardian": "ولي أمر",
        "guest": "مدعو كريم",
        "vip": "شخصية هامة (VIP)"
    }
    ticket_label = ticket_labels.get(ticket_type, ticket_type)

    # 1. Generate QR code image
    qr = qrcode.QRCode(version=1, error_correction=qrcode.constants.ERROR_CORRECT_H, box_size=10, border=2)
    qr.add_data(qr_code)
    qr.make(fit=True)
    img_qr = qr.make_image(fill_color="#1a1a2e", back_color="#f8fafc")
    qr_img_path = "/tmp/temp_qr.png"
    img_qr.save(qr_img_path)

    # 2. Build PDF using ReportLab
    c = canvas.Canvas(output_pdf_path, pagesize=A4)
    width, height = A4 # 595.27 x 841.89

    # Background: Dark luxurious #0f0f17
    c.setFillColorRGB(0.058, 0.058, 0.09)
    c.rect(0, 0, width, height, fill=1, stroke=0)

    # Gold border frame
    c.setStrokeColorRGB(0.788, 0.658, 0.298) # #c9a84c
    c.setLineWidth(2)
    c.rect(30, 30, width - 60, height - 60)

    # Inner subtle border
    c.setStrokeColorRGB(0.117, 0.117, 0.184) # #1e1e2f
    c.setLineWidth(1)
    c.rect(36, 36, width - 72, height - 72)

    # Fonts
    font_path = "/usr/share/fonts/opentype/fonts-hosny-amiri/Amiri-Bold.ttf"
    font_reg = "/usr/share/fonts/opentype/fonts-hosny-amiri/Amiri-Regular.ttf"

    from reportlab.pdfbase import pdfmetrics
    from reportlab.pdfbase.ttfonts import TTFont
    pdfmetrics.registerFont(TTFont('AmiriBold', font_path))
    pdfmetrics.registerFont(TTFont('AmiriReg', font_reg))

    # Header texts
    c.setFillColorRGB(0.788, 0.658, 0.298)
    c.setFont('AmiriBold', 22)
    c.drawCentredString(width / 2.0, height - 85, shape_text("مدارس العقيق الأهلية والدولية"))

    c.setFillColorRGB(0.890, 0.925, 0.965)
    c.setFont('AmiriReg', 14)
    c.drawCentredString(width / 2.0, height - 115, shape_text("حفل التخرج 2026 — بطاقة دعوة رسمية"))

    # Logo if available
    if logo_path and os.path.exists(logo_path):
        try:
            c.drawImage(logo_path, (width - 100) / 2, height - 190, width=100, height=55, preserveAspectRatio=True, mask='auto')
        except Exception:
            pass

    # Title Card Box
    c.setFillColorRGB(0.090, 0.090, 0.145) # #171725
    c.roundRect(80, height - 300, width - 160, 65, 8, fill=1, stroke=0)
    c.setFillColorRGB(0.788, 0.658, 0.298)
    c.setFont('AmiriBold', 20)
    c.drawCentredString(width / 2.0, height - 262, shape_text("بطاقة دخول الحفل"))

    # Details Box
    box_y = height - 540
    box_h = 210
    c.setFillColorRGB(0.090, 0.090, 0.145)
    c.roundRect(80, box_y, width - 160, box_h, 10, fill=1, stroke=1)

    # Details rows
    rows = [
        ("اسم الضيف الكريم:", full_name),
        ("رقم الهوية / الإقامة:", id_number),
        ("فئة الدعوة:", ticket_label),
        ("رقم المقعد المخصص:", f"مقعد رقم ({seat_number})" if seat_number else "مقبول عام / مقاعد VIP")
    ]

    row_y = box_y + box_h - 40
    for label, val in rows:
        c.setFillColorRGB(0.580, 0.639, 0.721)
        c.setFont('AmiriReg', 13)
        c.drawRightString(width - 110, row_y, shape_text(label))

        c.setFillColorRGB(0.972, 0.980, 0.988)
        c.setFont('AmiriBold', 14)
        c.drawRightString(width - 260, row_y, shape_text(val))

        # Divider line
        c.setStrokeColorRGB(0.164, 0.164, 0.239)
        c.setLineWidth(0.5)
        c.line(100, row_y - 12, width - 100, row_y - 12)

        row_y -= 42

    # QR Code Area
    qr_box_y = box_y - 215
    c.setFillColorRGB(0.090, 0.090, 0.145)
    c.roundRect(175, qr_box_y, width - 350, 200, 10, fill=1, stroke=1)

    c.drawImage(qr_img_path, (width - 130) / 2, qr_box_y + 45, width=130, height=130, preserveAspectRatio=True)

    c.setFillColorRGB(0.890, 0.925, 0.965)
    c.setFont('AmiriBold', 10)
    c.drawCentredString(width / 2.0, qr_box_y + 28, shape_text("امسح الرمز عند بوابة الدخول"))

    c.setFillColorRGB(0.392, 0.455, 0.545)
    c.setFont('AmiriReg', 8)
    c.drawCentredString(width / 2.0, qr_box_y + 12, shape_text(f"رمز التحقق: {qr_code}"))

    # Footer
    c.setFillColorRGB(0.392, 0.455, 0.545)
    c.setFont('AmiriReg', 9)
    c.drawCentredString(width / 2.0, 50, shape_text("نرجو إبراز هذه البطاقة عند بوابات الاستقبال. جميع الحقوق محفوظة لمدارس العقيق © 2026"))

    c.save()
    print("PDF generated successfully via Python.")

if __name__ == "__main__":
    create_invitation_pdf(sys.argv[1], sys.argv[2])
