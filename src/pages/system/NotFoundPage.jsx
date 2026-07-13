import { Button, Result } from 'antd'
import { useNavigate } from 'react-router-dom'

export default function NotFoundPage() {
  const navigate = useNavigate()
  return (
    <Result
      status="404"
      title="页面不存在"
      subTitle="您访问的路径未配置或已变更，请从首页或模块入口重新进入。"
      extra={[
        <Button type="primary" key="home" onClick={() => navigate('/home')}>返回首页</Button>,
        <Button key="classify" onClick={() => navigate('/opportunity/classify')}>商机识别</Button>,
        <Button key="profile" onClick={() => navigate('/system/profile')}>个人中心</Button>,
      ]}
    />
  )
}
