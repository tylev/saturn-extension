import React from 'react';
import { Button } from 'antd';
import './style.less';

export interface WelcomeCardProps {
  title: string;
  description: string;
  link: string;
  cta: string;
  icon?: string;
}

const WelcomeCard = ({ title, description, link, cta, icon }: WelcomeCardProps) => {
  return (
    <div className="WelcomeCard">
      <div className="WelcomeCard-info">
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
      <Button
        size="large"
        href={link}
        icon={icon}
        className="WelcomeCard-button"
        target="_blank"
      >
        {cta}
      </Button>
    </div>
  );
};

export default class WelcomeList extends React.Component {
  cards = [
    {
      title: 'Stack your first sats!',
      description: 'Complete this survey',
      link: 'https://livestream-poll.now.sh/',
      cta: 'Earn',
      icon: 'qrcode',
    },
  ];
  render() {
    // const { isFetchingTransactions, fetchTransactionsError } = this.props;

    // let content;
    // if (isFetchingTransactions) {
    //     content = <Loader />;
    // } else if (fetchTransactionsError) {
    //     content = (
    //         <BigMessage
    //             type="error"
    //             title="Failed to fetch transactions"
    //             message={fetchTransactionsError.message}
    //             button={{
    //                 children: 'Try again',
    //                 icon: 'reload',
    //                 onClick: () => this.props.getTransactions(),
    //             }}
    //         />
    //     );
    // }
    const content = this.cards.map(card => <WelcomeCard key={card.title} {...card} />);

    return <div className="WelcomeList">{content}</div>;
  }
}
