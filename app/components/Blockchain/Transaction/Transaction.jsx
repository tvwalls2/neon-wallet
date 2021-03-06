// @flow
import React, { Fragment } from 'react'
import type { Node } from 'react'

import moment from 'moment'
import { isEmpty } from 'lodash-es'
import classNames from 'classnames'
import { TX_TYPES } from '../../../core/constants'

import Button from '../../Button'
import { openExplorerTx } from '../../../core/explorer'
import styles from './Transaction.scss'
import ClaimIcon from '../../../assets/icons/claim.svg'
import SendIcon from '../../../assets/icons/send-tx.svg'
import ReceiveIcon from '../../../assets/icons/receive-tx.svg'
import ContactsAdd from '../../../assets/icons/contacts-add.svg'
import InfoIcon from '../../../assets/icons/info.svg'
import CopyToClipboard from '../../CopyToClipboard'
import Tooltip from '../../Tooltip'

type Props = {
  tx: TxEntryType,
  networkId: string,
  explorer: ExplorerType,
  contacts: Object,
  showAddContactModal: ({ address: string }) => null,
  address: string,
  className?: string
}

export default class Transaction extends React.Component<Props> {
  render = () => {
    const {
      tx: { type },
      className
    } = this.props
    return (
      <div className={classNames(styles.transactionContainer, className)}>
        {this.renderAbstract(type)}
        <Button
          className={styles.transactionHistoryButton}
          renderIcon={InfoIcon}
          onClick={this.handleClick}
        >
          View
        </Button>
      </div>
    )
  }

  findContact = (address: string): Node => {
    const { contacts } = this.props
    if (contacts && !isEmpty(contacts)) {
      const label = contacts[address]
      return label ? (
        <Tooltip title={address} className={styles.largerFont}>
          {label}
        </Tooltip>
      ) : (
        address
      )
    }
    return address
  }

  displayModal = (address: string) => {
    this.props.showAddContactModal({ address })
  }

  handleClick = () => {
    const { networkId, explorer, tx } = this.props
    const { txid } = tx
    openExplorerTx(networkId, explorer, txid)
  }

  renderTxDate = (time: ?number) => {
    if (!time) {
      return null
    }

    return (
      <div className={styles.txDateContainer}>
        {moment.unix(time).format('MM/DD/YYYY | HH:mm:ss')}
      </div>
    )
  }

  renderAbstract = (type: string) => {
    const { time, label, amount, isNetworkFee, to, from } = this.props.tx

    const contactTo = this.findContact(to)
    const contactToExists = contactTo !== to

    const txDate = this.renderTxDate(time)

    switch (type) {
      case TX_TYPES.CLAIM:
        return (
          <div className={styles.abstractContainer}>
            <div className={styles.txTypeIconContainer}>
              <div className={styles.claimIconContainer}>
                <ClaimIcon />
              </div>
            </div>
            {txDate}
            <div className={styles.txLabelContainer}>{label}</div>
            <div className={styles.txAmountContainer}>{amount}</div>
            <div className={styles.txToContainer}>
              <Fragment>
                <span>{contactTo}</span>
                {!contactToExists && (
                  <CopyToClipboard
                    className={styles.copy}
                    text={to}
                    tooltip="Copy Public Address"
                  />
                )}
              </Fragment>
            </div>
            <div className={styles.historyButtonPlaceholder} />
          </div>
        )
      case TX_TYPES.SEND:
        return (
          <div className={styles.abstractContainer}>
            <div className={styles.txTypeIconContainer}>
              <div className={styles.sendIconContainer}>
                <SendIcon />
              </div>
            </div>
            {txDate}
            <div className={styles.txLabelContainer}>{label}</div>
            <div className={styles.txAmountContainer}>{amount}</div>
            <div className={styles.txToContainer}>
              {isNetworkFee ? (
                to
              ) : (
                <Fragment>
                  <span>{contactTo}</span>
                  {!contactToExists && (
                    <CopyToClipboard
                      className={styles.copy}
                      text={to}
                      tooltip="Copy Public Address"
                    />
                  )}
                </Fragment>
              )}
            </div>
            {isNetworkFee ? (
              <div className={styles.historyButtonPlaceholder} />
            ) : (
              <Button
                className={styles.transactionHistoryButton}
                renderIcon={ContactsAdd}
                onClick={() => this.displayModal(to)}
                disabled={contactToExists}
              >
                Add
              </Button>
            )}
          </div>
        )
      case TX_TYPES.RECEIVE: {
        if (!from) {
          // shouldn't happen but for flow's sake
          return null
        }
        const contactFrom = this.findContact(from)
        const contactFromExists = contactFrom !== from
        const isMintTokens = from === 'MINT TOKENS'
        const isGasClaim = this.props.address === from && !Number(amount)
        return (
          <div className={styles.abstractContainer}>
            <div className={styles.txTypeIconContainer}>
              <div className={styles.receiveIconContainer}>
                <ReceiveIcon />
              </div>
            </div>
            {txDate}
            <div className={styles.txLabelContainer}>{label}</div>
            <div className={styles.txAmountContainer}>{amount}</div>
            <div className={styles.txToContainer}>
              <span>{contactFrom}</span>
              {!contactFromExists &&
                !isMintTokens && (
                  <CopyToClipboard
                    className={styles.copy}
                    text={from}
                    tooltip="Copy Public Address"
                  />
                )}
            </div>
            {isMintTokens || isGasClaim ? (
              <div className={styles.transactionHistoryButton} />
            ) : (
              <Button
                className={styles.transactionHistoryButton}
                renderIcon={ContactsAdd}
                onClick={() => this.displayModal(from)}
                disabled={contactFromExists}
              >
                Add
              </Button>
            )}
          </div>
        )
      }

      default:
        console.warn('renderTxTypeIcon() invoked with an invalid argument!', {
          type
        })
        return null
    }
  }
}
