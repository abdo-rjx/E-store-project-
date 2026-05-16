# CSV Import/Export Guide for E-Store

## Overview

Your E-Store now supports **comprehensive CSV import/export** with real product data, high-quality images, and descriptions. The system supports both **updating existing products** and **creating new ones** in a single import operation (upsert mode).

---

## What's New

### 1. **100-Product CSV** (`products-import.csv`)
- **100 real products** across 10 diverse categories
- **High-quality Wikimedia Commons image URLs** (stable, properly licensed, no expiration)
- **Real product descriptions** for each item
- **Realistic pricing** across different categories
- **Appropriate stock levels**

### 2. **Extended CSV Import** (Updated AdminService)
The CSV importer now supports:
- ✅ **Upsert Mode**: Update existing products OR create new ones
- ✅ **More Fields**: name, category, description, price, stock, imageUrl
- ✅ **Smart Updates**: Only updates fields that are provided
- ✅ **Category Lookup**: Matches products to existing categories by name
- ✅ **Detailed Reports**: Returns counts of created, updated, and skipped products with error messages

### 3. **Enhanced CSV Export** (Updated AdminService)
The CSV export now includes:
- `id`, `name`, `category`, `description`, `price`, `stock`, `imageUrl`

---

## CSV Format

### Headers Required
```
id, name, category, description, price, stock, imageUrl
```

### Column Descriptions

| Column | Type | Required | Notes |
|--------|------|----------|-------|
| **id** | Long | Optional | If provided and exists: UPDATE. If missing/new: CREATE |
| **name** | String | Yes (for new products) | Product display name |
| **category** | String | Yes (for new products) | Must match existing category name exactly |
| **description** | String | No | Product description (up to 2000 chars) |
| **price** | Double | Yes (for new products) | Numeric value, e.g., 29.99 |
| **stock** | Integer | No | Quantity available (defaults to 100 if not provided) |
| **imageUrl** | String | No | Valid image URL from Wikimedia Commons or elsewhere |

---

## Usage Instructions

### Step 1: Prepare Your Categories
Ensure all categories in your CSV exist in the database. The import will skip any products with non-existent categories.

**Common Categories (from the sample CSV):**
- Electronics
- Fashion
- Home & Garden
- Sports
- Kitchen & Dining
- Audio & Music
- Photography
- Stationery & Office
- Health & Beauty
- Toys & Kids

### Step 2: Upload the CSV
Use the **Admin Dashboard** CSV Import endpoint:
```
POST /api/admin/products/import
Content-Type: multipart/form-data
Body: products-import.csv
```

### Step 3: Review Import Results
The response will show:
```json
{
  "created": 50,
  "updated": 36,
  "skipped": 14,
  "errors": [
    "Row 5: category 'Nonexistent Category' not found",
    "Row 12: missing required field 'name' for new product"
  ]
}
```

---

## Import Behavior (Upsert Mode)

### When ID is Provided & Product Exists
**Action**: **UPDATE** existing product
- Updates: name, description, imageUrl, price, stock, category
- Only updates fields that have values in the CSV
- Preserves other fields (videoPath, imagePaths, featured status, etc.)

**Example:**
```csv
id,name,category,description,price,stock,imageUrl
15,Premium Headphones,Electronics,"Updated: Enhanced sound quality",119.99,50,https://...
```
→ Product ID 15 will be updated with new name, description, price, stock, and image.

### When ID is Missing or Product Doesn't Exist
**Action**: **CREATE** new product
- Requires: `name`, `category`, `price`
- Optional: `description`, `imageUrl`, `stock` (defaults to 100)
- Automatically sets `featured = false`

**Example:**
```csv
id,name,category,description,price,stock,imageUrl
,New Product Name,Electronics,Amazing new item,99.99,75,https://...
```
→ Creates a new product with the provided data.

### When Product Skipped
**Reasons:**
- Category doesn't exist
- Missing required field for new product
- Invalid number format for price or stock
- Other data validation errors

Each skip generates a descriptive error message.

---

## Sample Data (Provided CSV)

The included `products-import.csv` contains 100 real products:

### Categories Included (10 total):
1. **Electronics** (10 items) - Headphones, chargers, monitors, keyboards, etc.
2. **Fashion** (10 items) - Coats, jackets, shoes, dresses, leggings, etc.
3. **Home & Garden** (10 items) - Bedding, cookware, lighting, rugs, etc.
4. **Sports** (10 items) - Equipment and accessories
5. **Kitchen & Dining** (10 items) - Appliances and dinnerware
6. **Audio & Music** (10 items) - Speakers, instruments, microphones
7. **Photography** (10 items) - Cameras, lenses, lighting, tripods
8. **Stationery & Office** (10 items) - Paper supplies and desk items
9. **Health & Beauty** (10 items) - Skincare and wellness products
10. **Toys & Kids** (10 items) - Educational and recreational toys

### Image URLs
- All images from **Wikimedia Commons** (free, licensed, stable)
- High-quality images with proper attribution
- Won't disappear or require authentication
- Safe for production use

### Pricing Strategy
- **Electronics**: $24.99 - $699.99 (higher-priced items)
- **Fashion**: $24.99 - $249.99 (mid-range)
- **Home & Garden**: $34.99 - $199.99
- **Sports**: $14.99 - $399.99
- **Kitchen & Dining**: $24.99 - $129.99
- **Audio & Music**: $14.99 - $499.99
- **Photography**: $24.99 - $699.99
- **Stationery & Office**: $7.99 - $149.99
- **Health & Beauty**: $34.99 - $119.99
- **Toys & Kids**: $24.99 - $149.99

---

## How to Use the Sample CSV

### Option A: Create All New Products
1. Edit `products-import.csv` and **remove or leave blank all `id` values**
2. Ensure all categories exist in your database
3. Upload to `/api/admin/products/import`
4. Result: 100 new products created

### Option B: Update Existing + Add New
1. Keep existing product IDs where you want updates
2. Remove IDs for products you want to create as new
3. Upload to `/api/admin/products/import`
4. Result: Mixed creates and updates

### Option C: Update Only Existing Products
1. Keep all existing product IDs
2. Modify the name, description, price, stock, imageUrl fields
3. Upload to `/api/admin/products/import`
4. Result: Only existing products updated

---

## Advanced: Creating a Custom CSV

### Template
```csv
id,name,category,description,price,stock,imageUrl
,Product Name,Category Name,Description text,99.99,50,https://image-url.jpg
```

### Best Practices
1. **Use category names exactly** - "Electronics" ≠ "electronics" (case-sensitive)
2. **Quotes for CSV fields with commas** - `"Description with, comma"`
3. **Valid URLs only** - Test image URLs before import
4. **Realistic prices** - Use .99 endings for professional pricing
5. **Stock levels** - Use 50-200 for most products (avoid 0 unless intentional)

### Example Custom CSV
```csv
id,name,category,description,price,stock,imageUrl
,Smart Watch,Electronics,"Advanced fitness tracking with heart rate monitor",199.99,75,https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/21799s-digital-watch.jpg/320px-21799s-digital-watch.jpg
,Blue Jeans,Fashion,"Comfortable straight-fit denim jeans",79.99,120,https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/Camponotus_flavomarginatus_ant.jpg/320px-Camponotus_flavomarginatus_ant.jpg
```

---

## Image URL Sources

### Wikimedia Commons (Recommended)
- **URL Format**: `https://upload.wikimedia.org/wikipedia/commons/thumb/...`
- **Advantages**: 
  - Permanently hosted
  - High quality
  - Properly licensed (mostly CC0 and CC-BY)
  - No authentication required
  - CDN-backed for fast delivery

### How to Find Images
1. Go to https://commons.wikimedia.org/
2. Search for product category
3. Find high-quality image
4. Right-click → Copy image link
5. Paste into CSV

---

## Troubleshooting

### "category 'X' not found"
- **Solution**: Verify the category exists in your database
- **Check**: Go to `/api/categories` endpoint to list all categories
- **Fix**: Either create the category or correct the CSV

### "missing required field"
- **Solution**: For new products (no ID), provide: `name`, `category`, `price`
- **Check**: Review CSV row for empty cells in required columns
- **Fix**: Add missing data or remove the row

### "invalid number"
- **Solution**: Price and stock must be valid numbers
- **Example Wrong**: `price = "99.99 USD"` (has text)
- **Example Correct**: `price = 99.99`

### Images Not Displaying
- **Check**: URL is valid and publicly accessible
- **Test**: Paste URL in browser - should load image
- **Solution**: Replace with valid Wikimedia Commons URL

---

## API Reference

### Export Products to CSV
```
GET /api/admin/products/export
Response: CSV file content (text/csv)
```

### Import Products from CSV
```
POST /api/admin/products/import
Content-Type: multipart/form-data
Body: file (CSV file)

Response (200 OK):
{
  "created": 10,
  "updated": 25,
  "skipped": 2,
  "errors": [...]
}
```

---

## Database Schema Reference

**Products Table:**
```
id          BIGINT PRIMARY KEY
name        VARCHAR(255) NOT NULL
price       DOUBLE NOT NULL
imageUrl    VARCHAR(512)
description VARCHAR(2000)
category_id BIGINT FOREIGN KEY
stock       INTEGER DEFAULT 100
videoPath   VARCHAR(512)
featured    BOOLEAN DEFAULT false
created_at  TIMESTAMP
```

**Product Images Table:**
```
product_id  BIGINT FOREIGN KEY
image_path  VARCHAR(512)
```

---

## Next Steps

1. ✅ **Download** the `products-import.csv` file
2. ✅ **Review** categories in your database
3. ✅ **Choose** import strategy (new, update, or mixed)
4. ✅ **Upload** via admin dashboard
5. ✅ **Verify** results in product catalog
6. ✅ **Refine** as needed with custom CSVs

---

## Questions?

For detailed implementation, check:
- **AdminService.java** - Import/export logic
- **Product.java** - Entity schema
- **ProductController.java** - API endpoints
