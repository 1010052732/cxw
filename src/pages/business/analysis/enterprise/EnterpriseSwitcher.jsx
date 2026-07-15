import { Button, Space, Tag, Typography } from 'antd'
import { SearchOutlined } from '@ant-design/icons'

const { Text } = Typography

export default function EnterpriseSwitcher({ enterpriseName, onGoQuery }) {
  return (
    <Space wrap>
      <Text>当前企业</Text>
      <Tag color="processing">{enterpriseName}</Tag>
      <Button size="small" icon={<SearchOutlined />} onClick={onGoQuery}>更换企业</Button>
    </Space>
  )
}
