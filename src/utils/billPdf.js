import { formatOrderDate } from './orderFormatters.js'

const primary = [196, 90, 53]
const primaryDark = [143, 53, 31]
const ink = [52, 32, 26]
const slate = [71, 85, 105]
const muted = [148, 163, 184]
const border = [226, 232, 240]
const soft = [248, 250, 252]
const paymentStatusColor = (status) => {
  if (status === 'Paid') return [5, 150, 105]
  if (status === 'Partial') return [217, 119, 6]
  return [225, 29, 72]
}

const money = (value, currency = 'INR') => {
  const amount = Number(value || 0).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
  return `${currency} ${amount}`
}

const text = (value, fallback = '—') => String(value ?? '').trim() || fallback

const safeFilename = (value) => String(value || 'bill').replace(/[^a-zA-Z0-9_-]/g, '-')

export async function downloadBillPdf(bill, settings) {
  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' })
  const restaurant = settings.restaurant
  const billing = settings.billing
  const currency = restaurant.currency || 'INR'
  const margin = 16
  const pageWidth = doc.internal.pageSize.getWidth()
  const contentWidth = pageWidth - margin * 2

  doc.setProperties({
    title: `Bill ${bill.billNo}`,
    subject: `Restaurant bill for order ${bill.orderNo}`,
    author: restaurant.name || 'Restaurant',
    creator: restaurant.name || 'Restaurant',
  })

  doc.setFillColor(...primary)
  doc.roundedRect(margin, 14, 13, 13, 2.5, 2.5, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.text('R', margin + 6.5, 22.5, { align: 'center' })

  doc.setTextColor(...ink)
  doc.setFontSize(18)
  doc.text(text(restaurant.name, 'Restaurant'), margin + 17, 19.5)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...slate)
  doc.setFontSize(8.5)
  const contact = [restaurant.phone, restaurant.email].filter(Boolean).join('  |  ')
  if (contact) doc.text(contact, margin + 17, 24)

  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...primaryDark)
  doc.setFontSize(9)
  doc.text('RESTAURANT BILL', pageWidth - margin, 17.5, { align: 'right' })
  doc.setTextColor(...ink)
  doc.setFontSize(14)
  doc.text(`#${bill.billNo}`, pageWidth - margin, 23, { align: 'right' })
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...slate)
  doc.setFontSize(8.5)
  doc.text(formatOrderDate(bill.date, true), pageWidth - margin, 27, { align: 'right' })

  let y = 33
  if (restaurant.address) {
    doc.setFontSize(8.5)
    const addressLines = doc.splitTextToSize(restaurant.address, contentWidth * 0.68)
    doc.text(addressLines, margin, y)
    y += addressLines.length * 3.8
  }
  if (restaurant.gstTaxNumber) {
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...slate)
    doc.text(`GST / Tax No.: ${restaurant.gstTaxNumber}`, pageWidth - margin, y - 1, { align: 'right' })
    doc.setFont('helvetica', 'normal')
  }

  y = Math.max(y + 4, 43)
  doc.setDrawColor(...border)
  doc.line(margin, y, pageWidth - margin, y)
  y += 7

  const info = [
    ['Order No.', `#${bill.orderNo}`],
    ['Customer', text(bill.customerName)],
    ['Order Type', text(bill.orderType)],
    ['Area / Room', [bill.areaType, bill.areaRoomNo].filter(Boolean).join(' · ') || '—'],
    ['Biller', bill.billerName || (bill.biller ? 'Assigned user' : '—')],
    ['Payment Status', text(bill.paymentStatus)],
  ]
  const infoWidth = contentWidth / 3
  info.forEach(([label, value], index) => {
    const column = index % 3
    const row = Math.floor(index / 3)
    const x = margin + column * infoWidth
    const rowY = y + row * 15
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...muted)
    doc.setFontSize(7.5)
    doc.text(label.toUpperCase(), x, rowY)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...(label === 'Payment Status' ? paymentStatusColor(bill.paymentStatus) : ink))
    doc.setFontSize(9)
    doc.text(doc.splitTextToSize(value, infoWidth - 5), x, rowY + 4.5)
  })
  y += 34

  const columns = {
    item: margin,
    quantity: margin + 100,
    rate: margin + 126,
    amount: pageWidth - margin,
  }

  const drawTableHeader = () => {
    doc.setFillColor(...soft)
    doc.rect(margin, y, contentWidth, 9, 'F')
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...slate)
    doc.setFontSize(7.5)
    doc.text('ITEM', columns.item + 2, y + 5.8)
    doc.text('QTY', columns.quantity, y + 5.8, { align: 'center' })
    doc.text('RATE', columns.rate, y + 5.8, { align: 'right' })
    doc.text('AMOUNT', columns.amount - 2, y + 5.8, { align: 'right' })
    y += 9
  }

  const addItemsPage = () => {
    doc.addPage()
    y = 17
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...ink)
    doc.setFontSize(11)
    doc.text(`${restaurant.name || 'Restaurant'} · Bill #${bill.billNo}`, margin, y)
    y += 7
    drawTableHeader()
  }

  drawTableHeader()
  bill.items.forEach((item, index) => {
    const itemLabel = item.servingSize
      ? `${text(item.name)}\n${text(item.servingSize, '')}`
      : text(item.name)
    const itemLines = doc.splitTextToSize(itemLabel, 92)
    const rowHeight = Math.max(10, itemLines.length * 4 + 5)
    if (y + rowHeight > 267) addItemsPage()

    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...ink)
    doc.setFontSize(9)
    doc.text(itemLines, columns.item + 2, y + 6)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...slate)
    doc.text(String(item.quantity), columns.quantity, y + 6, { align: 'center' })
    doc.text(money(item.rate, currency), columns.rate, y + 6, { align: 'right' })
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...ink)
    doc.text(money(item.amount, currency), columns.amount - 2, y + 6, { align: 'right' })
    y += rowHeight
    doc.setDrawColor(...border)
    if (index < bill.items.length - 1) doc.line(margin, y, pageWidth - margin, y)
  })

  if (y + 72 > 277) {
    doc.addPage()
    y = 18
  } else {
    y += 7
  }

  const summaryX = margin + 91
  const summaryWidth = contentWidth - 91
  doc.setFillColor(...soft)
  doc.roundedRect(summaryX, y, summaryWidth, 48, 2, 2, 'F')
  const summaryRows = [
    ['Subtotal', money(bill.subtotal, currency)],
    ['Discount', `- ${money(bill.discount, currency)}`],
    ['Additional Charges', money(bill.additionalCharges, currency)],
  ]
  summaryRows.forEach(([label, value], index) => {
    const rowY = y + 8 + index * 8
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...slate)
    doc.setFontSize(8.5)
    doc.text(label, summaryX + 5, rowY)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...ink)
    doc.text(value, summaryX + summaryWidth - 5, rowY, { align: 'right' })
  })
  doc.setDrawColor(...border)
  doc.line(summaryX + 5, y + 33, summaryX + summaryWidth - 5, y + 33)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...primaryDark)
  doc.setFontSize(10)
  doc.text('FINAL AMOUNT', summaryX + 5, y + 41)
  doc.setFontSize(12)
  doc.text(money(bill.finalAmount, currency), summaryX + summaryWidth - 5, y + 41, { align: 'right' })

  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...ink)
  doc.setFontSize(10)
  doc.text('Payment Information', margin, y + 5)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...slate)
  doc.setFontSize(8.5)
  doc.text(`Payment Type: ${text(bill.paymentType)}`, margin, y + 13)
  doc.text(`Paid Amount: ${money(bill.paidAmount, currency)}`, margin, y + 21)
  doc.text(`Due Amount: ${money(bill.dueAmount, currency)}`, margin, y + 29)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...paymentStatusColor(bill.paymentStatus))
  doc.text(`Status: ${bill.paymentStatus}`, margin, y + 37)

  const footerMessage = text(billing.footerMessage, 'Thank you for dining with us!')
  const pageCount = doc.internal.getNumberOfPages()
  for (let page = 1; page <= pageCount; page += 1) {
    doc.setPage(page)
    doc.setDrawColor(...border)
    doc.line(margin, 281, pageWidth - margin, 281)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...muted)
    doc.setFontSize(7.5)
    doc.text(footerMessage, margin, 287)
    doc.text(`Page ${page} of ${pageCount}`, pageWidth - margin, 287, { align: 'right' })
  }

  doc.save(`${safeFilename(bill.billNo)}.pdf`)
}
