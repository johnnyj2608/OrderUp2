## About The Project
This full-stack web application enables remote food ordering for social adult day cares, allowing kitchen staff to set daily menus and track orders effortlessly. It features self-ordering capabilities with schedule-aware menus managed by the staff.

### Demo Video
[![Watch the demo](https://img.youtube.com/vi/j7rcgPCSdx0/0.jpg)](https://www.youtube.com/watch?v=j7rcgPCSdx0)

### Application Features
- **Meal Recording**: Whenever a user submits their order, their name and meal choices are recorded in the breakfast and lunch sheets.
- **Menu Management**: The menu can be updated and managed dynamically, allowing kitchen staff to adjust breakfast and lunch options as needed.
- **Unit Management**: Upon ordering, user units are reduced by one based on their schedule, and their order status is updated to reflect that they have already ordered for the day.
- **Order History**: A history of all meal selections is maintained for up to 30 days.

## Tools and Technologies
- **Backend:** Node.js with Express for handling server-side logic and API requests.
- **Frontend:** Bootstrap, HTML/CSS, and JavaScript for creating a responsive and intuitive user interface.
- **Apps Script:** Utilized for automated triggers to refresh menu options daily.
- **Google Sheets API:** Acts as the database for setting menus, viewing responses, and managing users.
- **Node Cache:** Implements caching to store menu options and reduces redundant API requests.
- **i18n:** Supports localization, making the application accessible to users in multiple languages.

## Getting Started
### 1. Install Node.js & Dependencies

First, ensure that [Node.js](https://nodejs.org/) is installed. Then, clone this repository and run the following command to install the necessary dependencies:

```bash
npm install express ejs googleapis nodemon node-cache i18n cookie-parser dotenv
```
Dependency Explanation:
- **express**: A minimal and flexible Node.js web application framework that provides robust features for building web applications and APIs.
- **ejs**: A simple templating language that lets you generate HTML markup with plain JavaScript. It's used for rendering dynamic content in the views.
- **googleapis**: The official Node.js client library for Google APIs. In this project, it’s used to interact with the Google Sheets API to fetch and update menu and order data.
- **nodemon**: A tool that helps develop Node.js applications by automatically restarting the server when file changes are detected.
- **node-cache**: A simple in-memory cache for storing frequently accessed data such as menu and order history to reduce the number of calls to Google Sheets.
- **i18n**: A lightweight translation library that provides localization support. It is used to manage multilingual support for the application, allowing users to switch between languages.
- **cookie-parser**: A middleware for parsing cookies attached to client requests. It’s useful for managing sessions and storing user preferences.
- **dotenv:** A module that loads environment variables from a .env file into process.env. It's used to keep sensitive configuration data, such as API keys and credentials, out of the source code.

### 2. Google Sheets API Setup
1. **Create or Select a Project**: Go to the [Google Cloud Console](https://console.cloud.google.com/). Create a new project (or use an existing one).
2. **Enable Google Sheets API**: Go to **API & Services > Library** and enable the Google Sheets API.
3. **Create Service Account**: In the **APIs & Services** section, go to **Credentials** and create a **Service account**.
4. **Download Credentials File**: Download the `credentials.json` file from the console.
5. **Extract Credentials**:
   - Open the `credentials.json` file and locate the `project_id`, `client_email`, and `private_key` fields.
   - Create a `.env` file in the root of your project directory if it does not already exist.
   - Add the following lines to your `.env` file:

     ```env
     GOOGLE_PROJECT_ID=sheets-xxxxxxxxxxxxxx
     GOOGLE_PRIVATE_KEY='{"privateKey":"-----BEGIN PRIVATE KEY.........-----END PRIVATE KEY-----\n"}'
     GOOGLE_CLIENT_EMAIL=conta-sheets-de-servi-o@xxxxxxxxxxxxx.iam.gserviceaccount.com
     ```

     Make sure to replace `GOOGLE_PROJECT_ID`, `GOOGLE_PRIVATE_KEY`, and `GOOGLE_CLIENT_EMAIL` with the actual values from the `credentials.json` file.

### 3. Google Sheets Template Setup
1. **Copy this template**: [Google Sheets Template](https://docs.google.com/spreadsheets/d/14HblEntMIxtcAZuRvUQCpKdHYad3tUtN52rxHmDLrqM/edit?usp=sharing).
2. **Share the Sheet**: Go to the "Share" button in the top-right corner, and share the sheet with the **service account email** found in your credentials file. Make sure to assign it as an editor.
3. **Insert Data**:
   - In the **Menu** Sheet, insert data for breakfast and lunch, including item names and associated images.
   - In the **Insurance** Sheet, insert member data such as ID, name, and schedule. Rename the sheet to reflect the associated insurance provider.
4. **Create Additional Sheets**: To support multiple insurance providers, create additional sheets for each insurance provider as needed.
5. **Add Triggers For Scripts**:
   1. Go to **Extensions** > **Apps Script**.
   2. In the left-hand menu, click on the **clock icon** (Triggers).
   3. Click **+ Add Trigger** for each of the following:

| **Function to Run**  | **Event Source**     | **Trigger Type**      | **Time/Day**        | **Description**                                           |
|----------------------|----------------------|-----------------------|---------------------|-----------------------------------------------------------|
| `refreshMenu`        | `From spreadsheet`   | `On edit`             | On every edit       | Refreshes the menu whenever a change is made.             |
| `refreshMenu`        | `Time-driven`        | `Day timer`           | 5am to 6am          | Updates the menu for the current day.                     |
| `refreshResponses`   | `Time-driven`        | `Day timer`           | 5am to 6am          | Clears out responses to prepare for new orders.           |
| `refreshUnits`       | `Time-driven`        | `Week timer`          | 5am to 6am (Sunday) | Resets food units based on the weekly schedule.           |

The project includes default images for the following [insurance providers / sheet names](./assets/js/imgMap.js)

### 4. Project Setup
1. **Include `SPREADSHEET_ID` in `.env` File**:
   - Locate the `.env` file in the root directory of your project.
   - Add your Google Sheets `SPREADSHEET_ID` to the `.env` file using the format:
     ```env
     SPREADSHEET_ID=your_spreadsheet_id_here
     ```
   - Replace `your_spreadsheet_id_here` with the actual ID of your Google Sheets file. This ID can be found in the URL of your Google Sheets document.

2. **Modify the Locale Title**:
   - Open the `locale` directory in your project.
   - For each language settig, find the line where the locale title is defined. For example:
     ```json
     {
       "project_title": "Project Title"
     }
     ```
   - Change `"Project Title"` to the title that suits your project. This title will be used throughout the application.

3. **Modify the Default Images**:
   - Navigate to the folder where your project stores image assets (e.g., `assets/img/`).
   - Replace the existing images with your own by updating the file with the name specified in your project configuration.
   - Ensure the new images has the same file name and format as the old one to avoid any reference issues. For example, if your configuration references `wallpaper.jpg`, ensure your new image file is named `wallpaper.jpg`.
  
### 5. Vercel Setup
1. **Create Vercel Account**
   - Sign up for a [Vercel account](https://vercel.com/signup) if you don’t already have one.

2. **Link GitHub and Import Project**
   - Go to your [Vercel Dashboard](https://vercel.com/dashboard).
   - Click on “New Project” and select “Import Project.”
   - Choose the GitHub repository where your Node.js project is hosted.

3. **Paste Environment Variables**
   - Go to the “Environment Variables” section.
   - Paste the environment variables from your `.env` file into the Vercel environment variable fields. This includes variables like `GOOGLE_PROJECT_ID`, `GOOGLE_PRIVATE_KEY`, `GOOGLE_CLIENT_EMAIL`, and `SPREADSHEET_ID`.

4. **Deploy and Testing**
   - Deploy your project and ensure everything is functioning as expected. 
   - If the Vercel static files do not update after redeployment on your custom domain, perform a hard refresh:
     - **For desktop**: Use `Ctrl + F5` (Windows) or `Command + Shift + R` (Mac).
     - **For mobile**: Turn on **Airplane Mode**, refresh the page (to fail), then turn AirPlane mode back off, then refresh the page to get the updated version.

If you cloned the project, all configurations and paths should already be set up.

### 6. QR Setup (Optional)
1. **Copy Vercel Deployment URL**
   - Obtain the deployment URL from your Vercel project dashboard.

2. **Paste URL into a QR Code Generator**
   - Use a QR code generator (such as [QR Code Generator](https://www.qr-code-generator.com/)) to create and download a QR code image.

3. **Paste QR Code Image in Google Sheets**
   - Open your Google Sheets template.
   - Go to the **QR Sheet**.
   - Insert the QR code image into each border cell where the QR code should appear (use the "Insert Image in Cell" option).

4. **Print Page and Cut with Scissors**
   - Print the Google Sheets page containing the QR codes.
   - Cut out the QR code sections using scissors as needed for distribution or display.

**Note**: If you do not wish to set up QR codes, you may delete the QR sheet from your Google Sheets template.

## How To Use
### Desktop Usage (Screenshots)
<table>
  <tr>
    <td><img width="735" alt="Screenshot 2024-09-18 at 12 20 52 PM" src="https://github.com/user-attachments/assets/56712ffe-0b02-49bb-bd82-98b928b8af92"></td>
    <td><img width="735" alt="Screenshot 2024-09-18 at 12 21 39 PM" src="https://github.com/user-attachments/assets/a4aa92e7-d4e2-421e-a2b9-949718c3a90f"></td>
  </tr>
  <tr>
    <td><img width="735" alt="Screenshot 2024-09-18 at 12 36 21 PM" src="https://github.com/user-attachments/assets/e665b097-af69-4e7e-8afb-511c08864491"></td>
    <td><img width="735" alt="Screenshot 2024-09-18 at 12 36 28 PM" src="https://github.com/user-attachments/assets/9cc333b8-efd3-4284-bb81-fceb0f1a236a"></td>
  </tr>
</table>

### Mobile Usage (Screenshots)
<table>
  <tr>
    <td align="center">
      <img src="https://github.com/user-attachments/assets/0ad94ce9-5405-4cf4-9412-92f64c90f322" alt="IMG_3162" width="200"/>
    </td>
    <td align="center">
      <img src="https://github.com/user-attachments/assets/368899f5-9d2c-457f-a575-566f4c0cc4f4" alt="IMG_3163" width="200"/>
    </td>
    <td align="center">
      <img src="https://github.com/user-attachments/assets/42ff4502-785c-45e2-964b-af8797476d50" alt="IMG_3164" width="200"/>
    </td>
    <td align="center">
      <img src="https://github.com/user-attachments/assets/2e6db3c8-2d6a-4510-9fa9-178e5ab069b0" alt="IMG_3166" width="200"/>
    </td>
  </tr>
</table>

## Optimizations
- **API Response Caching:** The application originally sent an API request to retrieve the menu every time a user accessed the web application, leading to slow data loading. I implemented a caching mechanism that stores the daily menu and periodically expires it to reflect changes in the spreadsheet database. This reduces the number of API calls and speeds up data loading.
- **Binary Search Member IDs:** Searching for member IDs in Google Sheets involved scanning through the entire list sequentially, which was inefficient for large datasets. To address this, I implemented a binary search algorithm. To ensure that users list member IDs sequentially, I implemented conditional formatting in Google Sheets. This formatting highlights any out-of-sequence IDs in red, providing immediate visual feedback to users.
- **Batch Update Optimization:** Updates to Google Sheets were made through individual API requests for each sheet, which was inefficient and prone to errors. I optimized this by implementing batch updates, consolidating multiple changes into a single API request. This approach not only reduced the number of API calls and improved performance but also included  error handling. If an error occurred with any sheet during the batch update, the system would catch it and halt the entire appendation process. 
- **Efficient Data Insertion:** To append data to the next available row within a specific column, I needed to call the API to retrieve the column range and identify the open row each time. This approach was inefficient because it required multiple API requests. I optimized this by implementing a solution where the server determines the open rows for each column when it starts up and stores this information locally in a hash map. This hash map is updated with each append request, significantly reducing the need for repeated API calls and improving overall performance.
- **Direct Column Indexing:** Originally, I passed the food name into the API request, searched for the name and its column location, and then appended the name. I realized I could directly pass the column number based on the index of the button on the Express template, allowing for direct appending by column index.
