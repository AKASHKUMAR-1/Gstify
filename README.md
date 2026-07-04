# GST Invoice Generator

A professional, feature-rich invoicing application built with React, TypeScript, and Tailwind CSS. Generate, download, and share GST-compliant invoices for your business.

## ✨ Features

- **GST Compliance** - Supports both intra-state (CGST + SGST) and inter-state (IGST) invoicing
- **Professional Templates** - Clean, printable invoice layouts with proper GST formatting
- **PDF Generation** - Download invoices as high-quality PDF files
- **Print Support** - Print-friendly invoice layouts with dark mode support
- **Sharing Options** - Share invoices via WhatsApp, Email, or native sharing
- **Logo & Signature** - Upload business logo and authorized signature
- **Bank Details** - Store and display bank information for payment instructions
- **Local Storage** - Seller details automatically saved to browser for quick access
- **Dark Mode** - Light and dark theme support
- **Responsive Design** - Works seamlessly on desktop and mobile devices
- **Amount in Words** - Automatic conversion of amounts to Indian English words

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd professionall-gst-invoice-generator
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:3000`

## 📦 Build for Production

```bash
npm run build
```

This creates an optimized production build in the `dist` folder.

## 🌐 Deployment

### Option 1: Vercel (Recommended)
```bash
npm install -g vercel
vercel
```

### Option 2: Netlify
1. Connect your GitHub repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `dist`

### Option 3: GitHub Pages
```bash
npm run build
# Push the dist folder to gh-pages branch
```

## 📋 How to Use

1. **Enter Seller Details** - Fill in your business information, logo, and signature
2. **Add Bank Details** - Include bank account and IFSC code for payment instructions
3. **Enter Buyer Information** - Add client details and GSTIN
4. **Select Tax Type** - Choose between same-state (CGST+SGST) or inter-state (IGST)
5. **Add Line Items** - Include products/services with HSN/SAC codes, quantity, and rates
6. **Preview & Download** - Preview the invoice and download as PDF
7. **Share** - Share via WhatsApp, Email, or other methods

## 🔧 Tech Stack

- **Framework**: React 19
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **PDF Generation**: jsPDF + html2canvas
- **Icons**: Lucide React
- **Build Tool**: Vite

## 📁 Project Structure

```
src/
├── App.tsx                 # Main app component
├── types.ts               # TypeScript type definitions
├── index.css              # Global styles
├── components/
│   ├── InvoiceEditor.tsx  # Form for invoice data
│   └── InvoiceTemplate.tsx # Invoice display template
└── utils/
    └── formatters.ts      # Utility functions
```

## 💾 Local Storage

- **Key**: `gst_invoice_seller_details`
- Your seller details are automatically saved to browser's local storage
- Clear browser data to reset stored information

## 🎨 Customization

You can customize:
- Invoice template layout in `InvoiceTemplate.tsx`
- Form fields in `InvoiceEditor.tsx`
- Color scheme in `index.css` (Tailwind configuration)
- GST tax rates in item configuration

## 📝 License

This project is open source and available under the MIT License.

## ❓ FAQ

**Q: Can I use this for business purposes?**  
A: Yes! This tool is designed for professional invoicing.

**Q: Is my data secure?**  
A: All data is stored locally in your browser. Nothing is sent to servers.

**Q: Can I customize the invoice template?**  
A: Yes, you can modify the template in `InvoiceTemplate.tsx`.

**Q: Does it support multiple currencies?**  
A: Currently supports INR. You can modify the currency format in `formatters.ts`.

## 🐛 Issues & Support

If you encounter any issues, please create an issue in the repository.

---

Built with ❤️ for Indian businesses
