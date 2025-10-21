# Use the official Node.js image as the base image
FROM node:18-alpine

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code to the working directory
COPY . .

# Build the Next.js application
RUN npm run build

# Verify the `.next` directory exists
RUN test -d .next || (echo "Build failed: .next directory not found" && exit 1)

# Expose the port the app runs on
EXPOSE 3000

# Start the application
CMD ["npm", "start"]