import { Button, Space, Tag, Typography } from 'antd'
import { SearchOutlined } from '@ant-design/icons'

const { Text } = Typography

/** 价格/供需/壁垒页共用的「更换商品」入口，跳转至查询 Tab 内联检索 */
export default function ProductSwitcher({ productName, skuLabel, onGoQuery }) {
  return (
    <Space wrap>
      <Text>当前商品</Text>
      <Tag color="processing">{skuLabel || productName}</Tag>
      {skuLabel && skuLabel !== productName && <Tag>档案：{productName}</Tag>}
      <Button size="small" icon={<SearchOutlined />} onClick={onGoQuery}>更换商品</Button>
    </Space>
  )
}
