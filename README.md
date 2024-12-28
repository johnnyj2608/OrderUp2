## About The Project
This full-stack web application enables remote food ordering for social adult day cares, allowing kitchen staff to set daily menus and track orders effortlessly. It features self-ordering capabilities with schedule-aware menus managed by the staff.

**Q**: How is it different from version 1?  
**A**: Instead of utilizing Google Sheets as the DB, it uses PostgreSQL hosted on Supabase. All API calls are now SQL queries and you can call them directly on the web app with 'edit modes' for each table.

### Demo Video
[![Watch the demo](https://img.youtube.com/vi/QUNo5Ob8d3M/0.jpg)](https://www.youtube.com/watch?v=QUNo5Ob8d3M)

### Application Features
- **Order Recording**: When an order is submitted, the system logs the date, member's name, meal choices, and timestamp in an orders table for easy reference.
- **Order Viewing**: View orders in a well-organized format, where each food item is displayed as a column with the list of members who selected it underneath.
- **Order Management**: View orders in a tabular format based on a selected date. All order data is stored for up to 90 days for easy access.
- **Menu Management**: Add individual menu items or upload a CSV file that includes the meal type, name, image, and days of the week the item is available.
- **Member Management**: Add members individually or upload a CSV file containing their index, name, and available days of the week.
- **Filter Option**: Allows users to filter by day of the week or by text to quickly locate specific orders or meal choices.
- **Popularity Tracking**: Monitor the popularity of menu items by tracking the frequency of each dish, with item counts updated with each order submission.
- **Eligibility Tracking**: Ensures that each member is only eligible to order food on the specified date and for the correct meal type based on their schedule.
- **Basic Authentication**: Ensure that only authorized users can access and use the application, protecting sensitive data and functionality.

## Tools and Technologies
- **Backend:** Node.js with Express for handling server-side logic and API requests, and PostgreSQL for data storage and management.
- **Frontend:** Bootstrap, HTML/CSS, and JavaScript for creating a responsive and intuitive user interface.
- **i18n:** Supports localization, making the application accessible to users in multiple languages.

## Getting Started
### 1. Install Node.js & Dependencies

First, ensure that [Node.js](https://nodejs.org/) is installed. Then, clone this repository and run the following command to install the necessary dependencies:

```bash
npm install express ejs nodemon i18n cookie-parser dotenv pg
```
Dependency Explanation:
- **express**: A minimal and flexible Node.js web application framework that provides robust features for building web applications and APIs.
- **ejs**: A simple templating language that lets you generate HTML markup with plain JavaScript. It's used for rendering dynamic content in the views.
- **nodemon**: A tool that helps develop Node.js applications by automatically restarting the server when file changes are detected.
- **i18n**: A lightweight translation library that provides localization support. It is used to manage multilingual support for the application, allowing users to switch between languages.
- **cookie-parser**: A middleware for parsing cookies attached to client requests. It’s useful for managing sessions and storing user preferences.
- **dotenv**: A module that loads environment variables from a .env file into process.env. It's used to keep sensitive configuration data, such as API keys and credentials, out of the source code.
- **pg**: A PostgreSQL client for Node.js. It allows the application to interact with a PostgreSQL database, enabling operations such as querying, inserting, updating, and deleting data from the database.

### 2. Project Setup
1. **Modify the Locale Title**:
   - Open the `locale` directory in your project.
   - For each language settig, find the line where the locale title is defined. For example:
     ```json
     {
       "project_title": "Project Title"
     }
     ```
   - Change `"Project Title"` to the title that suits your project. This title will be used throughout the application.

2. **Modify the Default Images**:
   - Navigate to the folder where your project stores image assets (e.g., `assets/img/`).
   - Replace the existing images with your own by updating the file with the name specified in your project configuration.
   - Ensure the new images has the same file name and format as the old one to avoid any reference issues. For example, if your configuration references `wallpaper.jpg`, ensure your new image file is named `wallpaper.jpg`.

### 3. Database Setup
1. **Create a Supabase Account**
   - Sign up for a [Supabase account](https://supabase.com/), if you don’t already have one.

2. **Create a New Project**
   - After logging into Supabase, click on the "New Project" button.
   - Provide a name for your project and choose a region (select the region closest to your users).
   - Set the database password, which will be used for connecting to your database later.
   - Click **Create new project** to proceed.

3. **Access Your Supabase Database**
   - Once your project is created, go to the **Database** section in the Supabase dashboard.
   - You will see the **Connection String** for your PostgreSQL database. This will be used to connect your application to the database.

4. **Create Tables in PostgreSQL**
   - You can use the **SQL editor** in Supabase to create your tables. The table structure is provided in this file: [Create Tables](./database/createTables.sql) 
  
### 4. Vercel Setup
1. **Create Vercel Account**
   - Sign up for a [Vercel account](https://vercel.com/signup), if you don’t already have one.

2. **Link GitHub and Import Project**
   - Go to your [Vercel Dashboard](https://vercel.com/dashboard).
   - Click on “New Project” and select “Import Project.”
   - Choose the GitHub repository where your Node.js project is hosted.

3. **Paste Environment Variables**
   - Go to the “Environment Variables” section in your Vercel dashboard.
   - Paste the environment variables from your `.env` file into the Vercel environment variable fields.
     - **Example**:
       - `DB_CONNECTION_STRING=your_supabase_connection_string`
       - `ADMIN_PASSWORD=your_password_for_basic_auth`

4. **Enable Supabase Integration**
   - In the **Integrations** section of your Vercel dashboard, browse for **Supabase**.
   - Click **Install Integration** and select the Supabase project you want to link with your Vercel project.

5. **Deploy and Testing**
   - Deploy your project and ensure everything is functioning as expected. 
   - If the Vercel static files do not update after redeployment on your custom domain, perform a hard refresh:
     - **For desktop**: Use `Ctrl + F5` (Windows) or `Command + Shift + R` (Mac).
     - **For mobile**: Turn on **Airplane Mode**, refresh the page (to fail), then turn AirPlane mode back off, then refresh the page to get the updated version.

If you cloned the project, all configurations and paths should already be set up.

## How To Use
### Desktop Usage (Screenshots)
<table>
  <tr>
    <td><img width="735" alt="Screenshot 2024-12-27 at 10 57 35 PM" src="https://github.com/user-attachments/assets/581b6a4d-bc0e-46c8-bc3a-323d9782d0ba" /></td>
    <td><img width="735" alt="Screenshot 2024-12-27 at 10 57 28 PM" src="https://github.com/user-attachments/assets/810b743d-0618-4673-9553-b70866aa96ad" /></td>
  </tr>
  <tr>
    <td><img width="735" alt="Screenshot 2024-12-27 at 10 56 34 PM" src="https://github.com/user-attachments/assets/707de7ca-c2a9-42a6-b5e5-4e7dc80468c1" /></td>
    <td><img width="735" alt="Screenshot 2024-12-27 at 10 57 01 PM" src="https://github.com/user-attachments/assets/cacb0f17-df6e-4cce-bdaf-d2573ca6a00a" /></td>
  </tr>
</table>

### Mobile Usage (Screenshots)
<table>
  <tr>
    <td align="center">
      <img width="200" alt="Screenshot 2024-12-28 at 11 09 37 AM" src="https://github.com/user-attachments/assets/13bff702-40b4-49d8-afae-2692bf07583a" />
    </td>
    <td align="center">
      <img width="200" alt="Screenshot 2024-12-28 at 11 10 10 AM" src="https://github.com/user-attachments/assets/8aa0db38-215a-4965-802b-f7b7648e7afd" />
    </td>
    <td align="center">
      <img width="400" alt="Screenshot 2024-12-28 at 11 11 07 AM" src="https://github.com/user-attachments/assets/622182f1-07a3-4e77-976d-e5b3b7c54b43" />
    </td>
    <td align="center">
      <img width="400" alt="Screenshot 2024-12-28 at 11 11 19 AM" src="https://github.com/user-attachments/assets/781f0ce6-679e-477a-a14f-82500eb4306b" />
    </td>
  </tr>
</table>
