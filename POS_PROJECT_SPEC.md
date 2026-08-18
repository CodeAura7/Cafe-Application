# Café POS Android Application - V1 Project Specification

## Project Goal

Build a simple, reliable, offline Android POS/billing application for a
small café/restaurant.

The app will run on a low-end Android tablet connected to a thermal
receipt printer.

Primary goals:

-   Create orders
-   Handle orders with or without a table
-   Select food/drink items
-   Set quantities
-   Apply a fixed discount amount
-   Complete bills
-   Print receipts
-   Store bill history
-   View day-end reports
-   Filter reports by date
-   View product-wise quantity sold and revenue

V1 must remain simple. Do not add unnecessary features or over-engineer
the application.

------------------------------------------------------------------------

# Technology Stack

## Application

-   React Native
-   TypeScript
-   Android
-   React Native CLI / bare React Native

## Database

-   SQLite
-   Local/offline only

## Navigation

-   React Navigation

## UI

-   Plain React Native components
-   StyleSheet/custom lightweight styling
-   Tablet-friendly
-   Large touch targets
-   Minimal visual complexity

## Printer

-   Native Android printer integration
-   Exact printer library/SDK will be selected after the actual printer
    brand, model, and connection type are known.
-   Printer integration must use a `PrinterService` abstraction.

## Deployment

-   APK installed directly on Android tablet
-   No Play Store requirement for V1

------------------------------------------------------------------------

# V1 Constraints

The application must:

-   Work offline
-   Work on low-end Android tablets
-   Be fast and lightweight
-   Use minimal dependencies
-   Keep business logic separate from UI
-   Use SQLite as the source of local data
-   Avoid unnecessary animations and visual effects

Do NOT use:

-   FastAPI
-   PostgreSQL
-   Firebase
-   Nhost
-   Cloud databases
-   Cloud synchronization
-   Next.js
-   Web application architecture
-   Payment gateway
-   AI features
-   Inventory/stock management
-   Advanced accounting
-   GST/tax accounting
-   Multi-branch management
-   Customer mobile application
-   Complex analytics
-   Advanced user roles

------------------------------------------------------------------------

# UI Philosophy

The application is a work-focused POS, not a design showcase.

Prioritize:

1.  Reliability
2.  Performance
3.  Fast interaction
4.  Clear information
5.  Maintainability
6.  Simple UI

Avoid:

-   Heavy UI libraries
-   Gradients
-   Glassmorphism
-   Complex animations
-   Large images
-   Unnecessary shadows
-   Fancy transitions
-   Image-heavy product cards
-   Complex charts
-   Excessive icons
-   Unnecessary dependencies

Use basic React Native components such as:

-   View
-   Text
-   Pressable
-   TextInput
-   FlatList
-   ScrollView
-   Modal
-   StyleSheet

------------------------------------------------------------------------

# Main Screen

When the app opens, show exactly four main options:

1.  New Order
2.  Tables
3.  Bill History
4.  Day End Report

------------------------------------------------------------------------

# Order and Table Logic

A table is OPTIONAL for an order.

There are two ways to work with orders:

1.  New Order
2.  Tables

They are not the same workflow.

------------------------------------------------------------------------

# New Order

New Order is primarily for customers who do not currently have an
assigned table.

Example:

-   All tables are occupied.
-   A new customer arrives.
-   Staff takes their order.
-   Customer does not have a table.
-   Staff completes the bill.

New Order must NOT require a table number.

New Order should support:

-   Customer name
-   Food/drink items
-   Quantities
-   Fixed discount
-   Bill completion

Example:

``` text
Order #1050
Customer: Amit
Table: Not Assigned
```

------------------------------------------------------------------------

# Tables

The Tables screen displays the café's physical tables.

Example:

``` text
Table 1
Table 2
Table 3
Table 4
Table 5
Table 6
```

Each table has:

-   AVAILABLE
-   OCCUPIED

Staff selects a table by tapping it.

Staff should NOT manually type a table number during normal table
ordering.

------------------------------------------------------------------------

# Available Table

If a table is AVAILABLE:

1.  Staff taps the table.
2.  Enter customer name.
3.  Start order.
4.  The order automatically receives the selected table.
5.  The table becomes OCCUPIED.

Example:

``` text
Table 3
Customer: Rahul
[ Start Order ]
```

------------------------------------------------------------------------

# Occupied Table

If a table is OCCUPIED:

Staff taps the table.

Show the existing active order.

Example:

``` text
Table 3
Customer: Rahul
Order #1025
Current Total: ₹620
```

Staff can:

-   View order
-   Add items
-   Change quantities
-   Apply/change discount
-   Complete bill

Do NOT create a second order for the same table.

------------------------------------------------------------------------

# Completing a Table Order

When a table order is completed:

1.  Save the bill.
2.  Mark order as completed.
3.  Print receipt.
4.  Mark the table AVAILABLE.

The completed order must remain stored.

------------------------------------------------------------------------

# Assigning a Table Later

A customer may initially have:

``` text
Order #1050
Customer: Amit
Table: Not Assigned
```

If a table becomes available later, staff can assign the existing order
to a table.

Example:

``` text
Order #1050
Customer: Amit
Table: 5
```

IMPORTANT:

-   Do NOT create a new order.
-   Update the existing order.
-   Mark the selected table OCCUPIED.
-   Only AVAILABLE tables can be assigned.
-   Do not allow multiple active orders for one table.

------------------------------------------------------------------------

# Products / Menu

Basic product management is required.

Each product contains:

-   ID
-   Name
-   Price
-   Active/inactive status
-   Created timestamp
-   Updated timestamp

Examples:

-   Garlic Bread
-   Maska Bun
-   Ginger Tea
-   Lemon Tea
-   Sandwich
-   Coffee

Owner can:

-   Add product
-   Edit product
-   Change price
-   Disable product

Disabled products must not appear in the normal ordering product list.

No inventory or stock management in V1.

------------------------------------------------------------------------

# Ordering / Cart

Staff can:

-   Select products
-   Increase quantity
-   Decrease quantity
-   Remove items
-   Add multiple products

Example:

``` text
Garlic Bread × 2
Maska Bun × 1
Ginger Tea × 2
```

Show:

``` text
Subtotal: ₹350
```

Product price at the time of ordering must be stored as a snapshot.

------------------------------------------------------------------------

# Discount

V1 supports ONLY fixed discount amounts.

Example:

``` text
Subtotal: ₹500
Discount: ₹50
Final Total: ₹450
```

Rules:

-   Staff manually enters the discount amount.
-   Percentage discount is NOT required.
-   Discount cannot make the final total negative.
-   Discount must be stored separately.

------------------------------------------------------------------------

# Bill Totals

Every order must preserve:

1.  Original/full price total
2.  Discount amount
3.  Final/discounted total

Example:

``` text
Original Total: ₹1,000
Discount: ₹100
Final Total: ₹900
```

Do NOT overwrite the original total with the discounted total.

The original total is required for reports.

------------------------------------------------------------------------

# Complete Order

When staff completes an order:

1.  Validate the order.
2.  Calculate totals.
3.  Save the order.
4.  Save order items.
5.  Save discount.
6.  Save table information if applicable.
7.  Mark order completed.
8.  Print receipt.
9.  Add to Bill History.

If the order has a table:

-   Mark the table AVAILABLE after completion.

If there is no table:

-   Complete normally without a table.

If printing fails:

-   The completed order must NOT be deleted.
-   The order remains stored.
-   Printing must be retryable later.

Use a database transaction where appropriate so order completion does
not leave partially saved data.

------------------------------------------------------------------------

# Thermal Receipt Printing

The exact printer model is not known yet.

Do NOT assume a specific printer.

Possible communication methods:

-   Bluetooth
-   USB
-   Wi-Fi
-   Manufacturer SDK
-   ESC/POS

Create a printer abstraction such as:

``` text
PrinterService

connect()
disconnect()
isConnected()
printReceipt()
testPrint()
```

The rest of the application must not directly depend on a specific
printer library.

Receipt should contain:

-   Business name
-   Order number
-   Date/time
-   Customer name if available
-   Table number if available
-   Items
-   Quantity
-   Unit price
-   Original total
-   Discount
-   Final total

If there is no table:

-   Do not display a fake table number.

Until the actual printer model is known, use a mock/test implementation
only.

------------------------------------------------------------------------

# Bill History

Bill History shows completed bills.

Each bill should contain:

-   Bill/order number
-   Order time
-   Customer name
-   Items ordered
-   Table number if applicable
-   Original/full total
-   Discount
-   Final/discounted total

Example:

``` text
Bill #1025

Customer: Rahul
Time: 7:42 PM
Table: 3

Garlic Bread × 2
Maska Bun × 1
Ginger Tea × 2

Original Total: ₹350
Discount: ₹30
Final Total: ₹320
```

Staff can open a completed bill to view its details.

Completed historical bills should not have casual deletion functionality
in V1.

------------------------------------------------------------------------

# Day End Report

Day End Report shows sales for a selected date.

Default:

-   Today

Show:

-   Total bills/orders
-   Original/full total
-   Total discount
-   Final/discounted total

Example:

``` text
Date: 10 August 2026

Total Bills: 72
Original Total: ₹9,450
Total Discount: ₹320
Final Total: ₹9,130
```

Reports must use actual completed orders stored in SQLite.

------------------------------------------------------------------------

# Date Filtering

Reports must support:

-   Today
-   Previous day
-   Custom date range

Example:

``` text
From: 01/08/2026
To: 10/08/2026
```

------------------------------------------------------------------------

# Item-Wise Sales

Owner needs to know how many units of a particular product were sold.

Example:

``` text
Garlic Bread
Quantity Sold: 15
Revenue: ₹1,500

Maska Bun
Quantity Sold: 27
Revenue: ₹1,350

Ginger Tea
Quantity Sold: 57
Revenue: ₹2,850
```

Owner can select/search a product and see:

-   Quantity sold
-   Revenue

for the selected date/date range.

Example:

``` text
Product: Sandwich
Date: 01/08/2026 - 10/08/2026

Quantity Sold: 247
Revenue: ₹24,700
```

Calculations must come from actual completed orders and ORDER_ITEMS in
SQLite.

No advanced analytics or charts are required.

------------------------------------------------------------------------

# Database

Use SQLite.

Minimum entities:

## PRODUCTS

-   id
-   name
-   price
-   is_active
-   created_at
-   updated_at

## TABLES

-   id
-   table_number
-   status

## ORDERS

-   id
-   order_number
-   customer_name
-   table_id nullable
-   status
-   subtotal
-   discount
-   final_total
-   created_at
-   updated_at

## ORDER_ITEMS

-   id
-   order_id
-   product_id
-   product_name_snapshot
-   unit_price_snapshot
-   quantity
-   item_total

------------------------------------------------------------------------

# Important Historical Data Rule

ORDER_ITEMS must store:

-   Product name snapshot
-   Unit price snapshot

Example:

Today:

``` text
Coffee = ₹50
```

Customer buys:

``` text
Coffee × 2
```

Later the owner changes:

``` text
Coffee = ₹70
```

The old bill must still show:

``` text
Coffee × 2
₹50 each
₹100
```

Historical bills must never change because of later product edits.

------------------------------------------------------------------------

# Offline Operation

The app must work without internet.

The following must work offline:

-   Create orders
-   Select tables
-   Add/edit/disable products
-   Apply discounts
-   Complete bills
-   Store history
-   View reports
-   Filter reports
-   View item-wise sales

No cloud backend is required for V1.

------------------------------------------------------------------------

# UI Requirements

The app is designed for an Android tablet at a café counter.

UI should be:

-   Simple
-   Clean
-   Fast
-   Touch-friendly
-   Large buttons
-   Easy to read
-   Minimal navigation
-   Low rendering cost

Billing should require as few taps as practical.

Do not prioritize visual effects over performance.

------------------------------------------------------------------------

# Project Structure

Use a clean structure such as:

``` text
src/
  components/
  screens/
  navigation/
  database/
  repositories/
  services/
    printer/
  types/
  utils/
```

Keep:

-   UI logic in screens/components
-   Database logic in database/repositories
-   Business logic in appropriate services
-   Printer logic behind PrinterService
-   Types/interfaces in types

Do not put raw SQL or business logic throughout UI components.

------------------------------------------------------------------------

# Development Phases

Build incrementally.

## Phase 1: Project Setup

-   React Native
-   TypeScript
-   Android
-   Basic folder structure
-   Confirm Android build and launch

## Phase 2: Navigation + Home

Home:

-   New Order
-   Tables
-   Bill History
-   Day End Report

Create placeholder screens.

## Phase 3: SQLite

Implement:

-   Database initialization
-   Tables
-   Basic migrations
-   Repository/database layer
-   TypeScript models

## Phase 4: Products

Implement:

-   Add product
-   Edit product
-   Change price
-   Disable product
-   Active product list

## Phase 5: Tables

Implement:

-   Table list
-   Available/occupied states
-   Start table order
-   Open existing occupied order
-   Prevent duplicate active table orders

## Phase 6: Orders + Cart

Implement:

-   New table-less order
-   Table-based order
-   Product selection
-   Quantity changes
-   Item removal
-   Cart totals

## Phase 7: Billing

Implement:

-   Fixed discount
-   Original total
-   Discount
-   Final total
-   Complete order
-   Table availability update

## Phase 8: Table Assignment Later

Implement:

-   Assign existing table-less active order to available table
-   Update existing order
-   Mark table occupied
-   Prevent duplicate active orders

## Phase 9: Bill History

Implement:

-   Completed bill list
-   Bill details
-   Historical data integrity

## Phase 10: Reports

Implement:

-   Today
-   Previous day
-   Custom date range
-   Total bills
-   Original total
-   Total discount
-   Final total
-   Product quantity sold
-   Product revenue

## Phase 11: Printer

Only after actual printer details are known.

Implement:

-   PrinterService
-   Actual printer connection
-   Receipt printing
-   Test print
-   Retry printing

## Phase 12: Testing + APK

Test the full workflow.

Build a release APK for direct installation.

------------------------------------------------------------------------

# Critical Business Rules

1.  Table assignment is OPTIONAL.

2.  New Order is for customers without an assigned table.

3.  Tables screen is for physical table orders.

4.  Staff selects tables by tapping them.

5.  Available table → start order → table becomes occupied.

6.  Occupied table → open existing active order.

7.  Completed table order → table becomes available.

8.  A table-less active order can later be assigned to a table.

9.  Assigning a table later updates the existing order and does NOT
    create a new order.

10. A table cannot have multiple active orders.

11. Original total, discount, and final total must all be stored.

12. Historical bills must not change when product prices change.

13. Core functionality must work offline.

14. Printing failure must never delete a completed order.

15. Disabled products must not appear in new orders.

16. Fixed discount only in V1.

17. Do not add percentage discounts.

18. Do not add inventory/stock management.

19. Do not add cloud functionality.

20. Do not add features that are not explicitly required.

------------------------------------------------------------------------

# Development Rules for AI Coding Agents

When working on this project:

1.  Read `POS_PROJECT_SPEC.md` before making changes.

2.  Work one phase at a time.

3.  Inspect the existing codebase before editing.

4.  Modify only files required for the current task.

5.  Preserve existing working functionality.

6.  Do not rewrite unrelated parts of the application.

7.  Do not add unnecessary dependencies.

8.  Do not invent new features.

9.  If something is ambiguous, choose the simplest implementation
    consistent with this specification.

10. Keep the UI lightweight and optimized for low-end Android tablets.

11. Keep business logic separate from UI.

12. Use TypeScript types properly.

13. Test each completed phase before starting the next.

14. Check for TypeScript and Android build errors.

15. Do not claim something works unless it has been tested.

16. Do not implement printer-specific code until the actual printer
    model and connection type are known.

17. Keep V1 small.

------------------------------------------------------------------------

# Final V1 Goal

Create a reliable, simple café POS Android application that can be
installed as an APK on the shop's tablet.

Main workflow:

``` text
HOME
  ↓
New Order OR Tables
  ↓
Customer
  ↓
Products + Quantities
  ↓
Discount
  ↓
Complete Bill
  ↓
Print Receipt
  ↓
Save Bill
  ↓
Bill History / Day End Report
```

The application should behave like a reliable work tool rather than a
visually complex consumer application.
