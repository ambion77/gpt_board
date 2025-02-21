import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,  // 또는 '0.0.0.0'
    //port: 3000, //5173과 3000번 포트 둘다 사용해야 하므로 주석처리 
    allowedHosts:['localhost' , 'ec2-13-124-155-126.ap-northeast-2.compute.amazonaws.com'] // EC2 퍼블릭 도메인 추가
  }
})
