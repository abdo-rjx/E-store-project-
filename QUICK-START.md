# Quick Start: CSV Import

## 🚀 In 3 Steps

### Step 1: Ensure Categories Exist
Make sure these categories exist in your database:
```
Electronics, Fashion, Home & Garden, Sports, Kitchen & Dining,
Audio & Music, Photography, Stationery & Office, Health & Beauty, Toys & Kids
```

If missing, create them via admin API:
```bash
POST /api/categories
{
  "name": "Electronics",
  "description": "Electronic devices and gadgets"
}
```

### Step 2: Import the CSV
Upload `products-import.csv` via admin dashboard or API:
```bash
POST /api/admin/products/import
Content-Type: multipart/form-data
File: products-import.csv
```

### Step 3: Check Results
You'll get a response like:
```json
{
  "created": 100,
  "updated": 0,
  "skipped": 0,
  "errors": []
}
```

✅ Done! 100 products with real data and images are now in your store.

---

## 📊 What You Get

**100 Real Products** across 10 categories:
- ✅ Real product names
- ✅ Realistic descriptions  
- ✅ Appropriate pricing ($7.99 - $699.99)
- ✅ Stock levels (25 - 500 units)
- ✅ High-quality images from Wikimedia Commons
- ✅ Ready-to-use product catalog

---

## 📁 Files You Have

1. **products-import.csv** - The 100-product dataset
2. **CSV-IMPORT-GUIDE.md** - Detailed documentation
3. **IMPLEMENTATION-CHECKLIST.md** - Technical reference

---

## ⚡ Key Features

### Upsert Mode
- **Update existing** products by ID
- **Create new** products if ID doesn't exist
- **Smart field updates** - only updates provided fields

### Supported Fields
- `id` - Product ID (optional)
- `name` - Product name (required for new)
- `category` - Category name (required for new)
- `description` - Product description (optional)
- `price` - Price in dollars (required for new)
- `stock` - Quantity available (optional, defaults to 100)
- `imageUrl` - Image URL (optional)

### Error Handling
Each import shows:
- ✅ Count of created products
- ✅ Count of updated products
- ✅ Count of skipped rows
- ✅ Detailed error messages per row

---

## 🎯 Common Use Cases

### Use Case 1: Populate Empty Store
1. Leave all `id` values empty in CSV
2. Import
3. All 100 products created as new

### Use Case 2: Update Existing Products
1. Keep existing product IDs in CSV
2. Import with new names, descriptions, prices
3. Existing products updated with new data

### Use Case 3: Mixed Operations
1. Some rows with existing IDs (updates)
2. Some rows without IDs (creates new)
3. Import processes both simultaneously

---

## 🔧 Behind the Scenes

**What Changed:**
1. **AdminService.importProductsCsv()** - Now supports upsert
2. **AdminService.exportProductsCsv()** - Now exports all fields
3. **products-import.csv** - New 100-product dataset

**No API endpoints changed** - Use existing import/export endpoints.

---

## ❓ Troubleshooting

### Category Not Found?
```
Error: Row 10: category 'Electronics' not found
```
→ Create the category first or fix the spelling (case-sensitive)

### Missing Required Field?
```
Error: Row 5: missing required field 'name' for new product
```
→ Provide name, category, and price for new products

### Invalid Price/Stock?
```
Error: Row 12: invalid number — For input string: "99.99 USD"
```
→ Use only the number: `99.99` (not "99.99 USD")

---

## 📖 Need More Details?

- **CSV Format Guide**: See `CSV-IMPORT-GUIDE.md`
- **Technical Details**: See `IMPLEMENTATION-CHECKLIST.md`
- **Code Changes**: See `backend/src/main/java/com/estore/admin/service/AdminService.java`

---

## ✅ Ready to Go!

Your E-Store now has:
- ✅ 100 real products ready to import
- ✅ Enhanced CSV importer with upsert support
- ✅ Better product data export
- ✅ Complete documentation

**Next:** Create your categories and import the products!

---

**Questions?** Check the detailed guides for comprehensive information.
