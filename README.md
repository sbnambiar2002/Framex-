# FrameX 💸

[![Netlify Status](https://api.netlify.com/api/v1/badges/7a949acc-3c88-4dc0-b405-1d110b04b07c/deploy-status)](https://app.netlify.com/sites/YOUR_SITE_NAME/deploys)
> **Note:** To make the badge link work, go to your Netlify site's **Project configuration > Status badges** page. Copy the full markdown snippet provided there and replace the first line of this README file. This will ensure both the badge image and the link are correct for your site.

An application for employees to track payments and expenses, with a cumulative admin view for oversight. Users can manage their own entries, while the admin has full control over all records.

This project was built and deployed using:
- **Framework**: React with TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Supabase (Database, Authentication, Storage)
- **Deployment**: Netlify

## ✨ Key Features

- **Secure Authentication**: User sign-up, login, and password recovery.
- **Role-Based Access Control**: Separate views and permissions for 'Admin' and 'User' roles.
- **CRUD Operations**: Add, edit, and delete expense entries.
- **Data Management**: Admins can manage master data like Cost Centers, Project Codes, Parties, etc.
- **User Management**: Admins can invite and manage other users.
- **Analytics Dashboard**: Admins can view charts and analytics on expenses.
- **CSV Export**: Export expense data to a CSV file.
- **Company Customization**: Admins can upload a company logo.