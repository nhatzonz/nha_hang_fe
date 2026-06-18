# ---- Build stage ----
FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

# Biến môi trường của CRA được "nhúng" lúc build -> phải truyền qua build args.
# Đây là URL mà TRÌNH DUYỆT người dùng gọi tới, nên là địa chỉ public của BE.
ARG REACT_APP_API_URL=http://localhost:3001/api
ARG REACT_APP_ASSET_URL=http://localhost:3001
ENV REACT_APP_API_URL=$REACT_APP_API_URL
ENV REACT_APP_ASSET_URL=$REACT_APP_ASSET_URL

COPY . .
RUN npm run build

# ---- Serve stage ----
FROM nginx:alpine AS production
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
