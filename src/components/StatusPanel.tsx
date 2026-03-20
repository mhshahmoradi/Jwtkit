type StatusPanelProps = {
  isValid: boolean
  hasSignature: boolean
  error: string | null
}

const StatusPanel = (props: StatusPanelProps) => {
  return (
    <div class="status-panel">
      <div class={props.isValid ? 'status-item ok' : 'status-item'}>
        {props.isValid ? '✓ Valid JWT' : '• Invalid JWT'}
      </div>
      <div class={props.isValid && props.hasSignature ? 'status-item ok' : 'status-item'}>
        {props.isValid && props.hasSignature ? '✓ Signature Present' : '• Signature Missing'}
      </div>
      {props.error && <div class="status-item error">{props.error}</div>}
    </div>
  )
}

export default StatusPanel
