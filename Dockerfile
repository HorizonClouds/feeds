# Backend
FROM node:18
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# Set environment variable for the port
ENV BACKEND_PORT=3000

# Expose the port
ARG PORT=80
ENV PORT $PORT
EXPOSE $PORT

CMD ["npm", "run", "start"]
