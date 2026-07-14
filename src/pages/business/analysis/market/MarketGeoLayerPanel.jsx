import { Checkbox, Col, Row, Typography } from 'antd'
import { MAP_LAYER_GROUPS, MAP_LAYERS } from '../../../../mock/analysis'

const { Text } = Typography

const layerLabelMap = Object.fromEntries(MAP_LAYERS.map((l) => [l.key, l.label]))

export default function MarketGeoLayerPanel({ mapLayers, onChange, availableLayerKeys = [] }) {
  const handleGroupChange = (groupKeys, checked) => {
    const next = new Set(mapLayers)
    groupKeys.forEach((key) => {
      if (checked.includes(key)) next.add(key)
      else next.delete(key)
    })
    onChange([...next])
  }

  return (
    <div className="market-geo-layer-panel">
      <Row gutter={[12, 8]}>
        {MAP_LAYER_GROUPS.map((group) => {
          const options = group.layers
            .filter((key) => availableLayerKeys.includes(key))
            .map((key) => ({
              value: key,
              label: layerLabelMap[key] || key,
            }))
          if (!options.length) return null
          const groupValue = mapLayers.filter((k) => group.layers.includes(k))
          return (
            <Col xs={24} sm={12} key={group.key}>
              <div className="market-geo-layer-group">
                <Text strong style={{ fontSize: 12 }}>{group.label}</Text>
                <Text type="secondary" style={{ display: 'block', fontSize: 11, marginBottom: 4 }}>{group.hint}</Text>
                <Checkbox.Group
                  options={options}
                  value={groupValue}
                  onChange={(checked) => handleGroupChange(group.layers, checked)}
                />
              </div>
            </Col>
          )
        })}
      </Row>
    </div>
  )
}
