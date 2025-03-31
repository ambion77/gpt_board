# Node.js LTS 버전 이미지 사용
FROM node:18

# 작업 디렉토리 설정
WORKDIR /app


# package.json과 package-lock.json 복사 후 의존성 설치
COPY package.json package-lock.json ./
RUN npm install

# 필수 패키지 설치(sharp.js 때문에 libvips 추가설치필요)
RUN apt-get update && apt-get install -y \
    libvips \
    libvips-dev \
    build-essential \
    python3 \
    python3-pip \
    && rm -rf /var/lib/apt/lists/*

# 소스 코드 복사
COPY . .

# Vite 빌드 실행
RUN npm run build

# 사용할 포트 설정
EXPOSE 5179 3009

# 컨테이너 시작 시 Vite 및 Node 서버 실행
CMD ["npm", "run", "prd"]

