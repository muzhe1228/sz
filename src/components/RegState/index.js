import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {lStore} from 'js/index';
import { autobind } from 'core-decorators';
import {Icon,Button} from 'antd'
import {connect} from 'react-redux';
import './style.less';

@autobind
class RegState extends Component {
  static props = {
    isShow: PropTypes.boolean,
  }
  static defaultProps = {
    isShow: false
}
handleClose(){
  const {onClick } = this.props;
  onClick && onClick();
}
  render() {
    const { isShow , lang} = this.props;
    let content = null
    if(lang == 'zh'|| !lang)
    {
      content = 
      <div>
      <h1>sz.com注册协议</h1>
      <span className='closeIcon'>
      <Icon type="close" onClick={this.handleClose}/>
      </span>
      <ul class="protocol_zh">
          <li>
              <h3>1、签署协议</h3>
              <p>1.
                  本协议内容包括协议正文及所有SZ.COM已经发布的或将来可能发布的各类规则。所有规则为本协议不可分割的组成部分，与协议正文具有同等法律效力。除另行明确声明外，任何SZ.COM及其关联公司提供的服务（以下称为SZ.COM服务）均受本协议约束。</p>
              <p>2.
                  您应当在使用SZ.COM服务之前认真阅读全部协议内容，如您对协议有任何疑问的，应向SZ.COM咨询。但无论您事实上是否在使用SZ.COM服务之前认真阅读了本协议内容，只要您使用SZ.COM服务，则本协议即对您产生约束，届时您不应以未阅读本协议的内容或者未获得SZ.COM对您问询的解答等理由，主张本协议无效，或要求撤销本协议。</p>
              <p>3. 您承诺接受并遵守本协议的约定。如果您不同意本协议的约定，您应立即停止注册/激活程序或停止使用SZ.COM服务。</p>
              <p>4.
                  SZ.COM有权根据需要不时地制订、修改本协议及/或各类规则，并以网站公示的方式进行公告，不再单独通知您。变更后的协议和规则一经在网站公布后，立即自动生效。如您不同意相关变更，应当立即停止使用SZ.COM服务。您继续使用SZ.COM服务的，即表示您接受经修订的协议和规则。</p>
          </li>
          <li>
              <h3>2、注册与账户</h3>
              <p>
                  <span class="subTitle">1. 注册者资格</span>
                  <span>用户具有完全民事权利能力和行为能力或虽不具有完全民事权利能力和行为能力,但点击同意注册按钮，本网即视为经其法定代理人同意并由其法定代理人代理注册及使用SZ.COM服务。若您不具备前述主体资格，则您及您的监护人应承担因此而导致的一切后果，且SZ.COM有权注销或永久冻结您的账户，并向您及您的监护人索偿。</span>
              </p>
              <p>
                  <span class="subTitle">2. 注册和账户</span>
                  <span>用户同意根据SZ.COM注册页面的要求提供有效联系信息，如手机号等信息，设置SZ.COM账号及密码，用户应确保所提供全部信息的真实性、完整性和准确性。 用户合法、完整并有效提供注册所需信息的，有权获得SZ.COM账号和密码，SZ.COM账号和密码用于用户在SZ.COM进行会员登录。 用户获得SZ.COM账号及密码时视为用户注册成功。 用户同意接收SZ.COM发送的与SZ.COM网站管理、运营相关的电子邮件和/或短消息。</span>
              </p>
              <p>
                  <span class="subTitle">3. 用户信息</span>
                  <span>有合理理由怀疑您提供的资料错误、不实、过时或不法规的信息。 SZ.COM有权向您发出询问或要求改正的通知，并有权直接做出删除相应资料的处理， 直至中止或终止对您提供部分或全部SZ.COM服务。SZ.COM对此不承担任何责任，您将承担因此产生的任何直接或间接损失及不利后果。</span>
                  <span>您应当准确填写并及时更新您提供的电子邮件地址、联系电话、联系地址、邮政编码等联系方式，以便SZ.COM或其他用户与您进行有效联系，因通过这些联系方式无法与您取得联系，导致您在使用SZ.COM服务过程中产生任何损失或增加费用的，应由您完全独自承担。您了解并同意，您有义务保持您提供的联系方式的有效性，如有变更或需要更新的，您应按SZ.COM的要求进行操作。</span>
              </p>
              <p>
                  <span class="subTitle">4. 账户安全</span>
                  <span>您须自行负责对您的SZ.COM昵称和密码的保密，且须对您在该登录名、SZ.COM昵称和密码下发生的所有活动（包括但不限于信息披露、发布信息、网上点击同意或提交各类规则协议、网上续签协议或购买服务等）承担责任。 您同意：</span>
                  <span>(a)如发现任何人未经授权使用您的SZ.COM昵称和密码，或发生违反保密规定的任何其他情况，您会立即通知SZ.COM；</span>
                  <span>(b)确保您严格遵守网站/服务的安全、认证、交易、充值、提现机制或者流程；</span>
                  <span>(c)确保您在每个上网时段结束时，以正确步骤离开网站/服务。SZ.COM不能也不会对因您未能遵守本款规定而发生的任何损失负责。您理解SZ.COM对您的请求采取行动需要合理时间，SZ.COM对在采取行动前已经产生的后果（包括但不限于您的任何损失）不承担任何责任。</span>
              </p>
          </li>
          <li>
              <p>3、SZ.COM服务</p>
              <p>1.
                  通过SZ.COM及其关联公司提供的SZ.COM服务和其它服务，会员可在SZ.COM上发布交易信息、查询币种价格和交易信息、达成交易意向并进行交易、参加SZ.COM组织的活动以及使用其它信息服务及技术服务。</p>
              <p>2.
                  您在SZ.COM上交易过程中与其他会员发生交易纠纷时，一旦您或其它会员任一方或双方共同提交SZ.COM要求调处，则SZ.COM有权根据单方判断做出调处决定，您了解并同意接受SZ.COM的判断和调处决定。</p>
              <p>3.
                  您了解并同意，SZ.COM有权应您所在地政府部门（包括司法及行政部门）的要求，向其提供您向SZ.COM提供的用户信息和交易记录等必要信息。如您涉嫌侵犯他人合法权益，则SZ.COM亦有权在初步判断涉嫌侵权行为存在的情况下，向权利人提供您必要的身份信息。</p>
              <p>4. 您在使用SZ.COM服务过程中，所产生的应纳税赋，以及一切硬件、软件、服务及其它方面的费用，均由您独自承担。</p>
          </li>
          <li>
              <h3>4、SZ.COM服务使用规范</h3>
              <p>
                  <span>
                      1.在SZ.COM上使用SZ.COM服务过程中，您承诺遵守以下约定：在使用SZ.COM服务过程中实施的所有行为均遵守您所在国家法律、法规等规范性文件及SZ.COM各项规则的规定和要求，不违背社会公共利益或公共道德，不损害他人的合法权益，不偷逃应缴税费，不违反本协议及相关规则。您如果违反前述承诺，产生任何法律后果的，您应以自己的名义独立承担所有的法律责任，并确保SZ.COM免于因此产生任何损失。
                  </span>
                  <span>
                      在与其他会员交易过程中，遵守诚实信用原则，不采取不正当竞争行为，不扰乱网上交易的正常秩序，不从事与网上交易无关的行为。不对SZ.COM上的任何数据作商业性利用，包括但不限于在未经SZ.COM事先书面同意的情况下，以复制、传播等任何方式使用SZ.COM站上展示的资料。不使用任何装置、软件或例行程序干预或试图干预SZ.COM的正常运作或正在SZ.COM上进行的任何交易、活动。您不得采取任何将导致不合理的庞大数据负载加诸SZ.COM网络设备的行动。
                  </span>
              </p>
              <p>
                  <span>
                      2. 您了解并同意：SZ.COM有权对您是否违反上述承诺做出单方认定，并根据单方认定结果适用规则予以处理或终止向您提供服务，且无须征得您的同意或提前通知予您。基于维护SZ.COM交易秩序及交易安全的需要，SZ.COM有权在发生恶意出售或者购买等扰乱市场正常交易秩序的情形下，执行关闭相应交易订单等操作。经您所在地区国家行政或司法机关的生效法律文书确认您存在违法或侵权行为，或者SZ.COM根据自身的判断，认为您的行为涉嫌违反本协议和/或规则的条款或涉嫌违反法律法规的规定的，则SZ.COM有权在SZ.COM上公示您的该等涉嫌违法或违约行为及SZ.COM已对您采取的措施。对于您在SZ.COM上发布的涉嫌违法或涉嫌侵犯他人合法权利或违反本协议和/或规则的信息，SZ.COM有权不经通知您即予以删除，且按照规则的规定进行处罚。
                  </span>
                  <span>
                      对于您在SZ.COM上实施的行为，包括您未在SZ.COM上实施但已经对SZ.COM及其用户产生影响的行为，SZ.COM有权单方认定您行为的性质及是否构成对本协议和/或规则的违反，并据此作出相应处罚。您应自行保存与您行为有关的全部证据，并应对无法提供充要证据而承担的不利后果。对于您涉嫌违反承诺的行为对任意第三方造成损害的，您均应当以自己的名义独立承担所有的法律责任，并应确保SZ.COM免于因此产生损失或增加费用。如您涉嫌违反有关法律或者本协议之规定，使SZ.COM遭受任何损失，或受到任何第三方的索赔，或受到任何行政管理部门的处罚，您应当赔偿SZ.COM因此造成的损失及（或）发生的费用，包括合理的律师费用。
                  </span>
              </p>
          </li>
          <li>
              <h3>5、责任范围和责任限制</h3>
              <p>1.
                  SZ.COM负责按“现状”和“可得到”的状态向您提供SZ.COM相关服务。但SZ.COM对SZ.COM提供的服务不作任何明示或暗示的保证，包括但不限于SZ.COM服务的适用性、没有错误或疏漏、持续性、准确性、可靠性、适用于某一特定用途。同时，SZ.COM也不对SZ.COM服务所涉及的技术及信息的有效性、准确性、正确性、可靠性、质量、稳定、完整和及时性作出任何承诺和保证。</p>
              <p>2. 您了解SZ.COM上的信息系用户自行发布，且可能存在风险和瑕疵。</p>
              <p>3.
                  SZ.COM仅作为交易地点。SZ.COM仅作为您获取比特币为代表的各币种信息、物色交易对象、就比特币或者其他币种的交易进行协商及开展交易的场所，但SZ.COM无法控制交易所涉及的比特币或其他币种的质量、安全或合法性，交易信息的真实性或准确性，以及交易各方履行其在交易协议中各项义务的能力。您应自行谨慎判断确定相关比特币及/或信息的真实性、合法性和有效性，并自行承担因此产生的责任与损失。除非法律法规明确要求，或出现以下情况，否则，SZ.COM没有义务对所有用户的信息数据、比特币或其他币种的信息、交易行为以及与交易有关的其它事项进行事先审查：SZ.COM有合理的理由认为特定会员及具体交易事项可能存在重大违法或违约情形。SZ.COM有合理的理由认为用户在SZ.COM的行为涉嫌违法或不当。</p>
              <p>
                  <span>
                      4. SZ.COM或SZ.COM授权的第三方或您与SZ.COM一致同意的第三方有权基于您不可撤销的授权受理您与其他会员因交易产生的争议，并有权单方判断与该争
                      议相关的事实及应适用的规则，进而作出处理决定，包括但不限于调整相关订单的交易状态，指令第三方支付公司或者客服将争议货款的全部或部分支付给交易一方或双方。该处理决定对您有约束力。如您未在限期内执行处理决定的，则SZ.COM有权利（但无义务）直接使用您尚在SZ.COM账户内的款项，或您向比SZ.COM及其关联公司交纳的保证金代为支付。
                  </span>
                  <span>
                      您应及时补足保证金并弥补SZ.COM及其关联公司的损失，否则SZ.COM及其关联公司有权直接抵减您在其它合同项下的权益，并有权继续追偿。
                      您理解并同意，SZ.COM或SZ.COM授权的第三方或您与SZ.COM一致同意的第三方并非司法机构，仅能以普通人的身份对证据进行鉴别，SZ.COM或SZ.COM授权的第三方或您与SZ.COM一致同意的第三方对争议的调处完全是基于您不可撤销得授权，其无法保证争议处理结果符合您的期望，也不对争议调处结论承担任何责任。如您因此遭受损失，您同意自行向受益人索偿。
                  </span>
              </p>
              <p>5.
                  您了解并同意，SZ.COM不对因下述任一情况而导致您的任何损害赔偿承担责任，包括但不限于利润、商誉、使用、数据等方面的损失或其它无形损失的损害赔偿（无论SZ.COM是否已被告知该等损害赔偿的可能性）：SZ.COM有合理的理由认为特定会员及具体交易事项可能存在重大违法或违约情形。SZ.COM有合理的理由认为用户在SZ.COM的行为涉嫌违法或不当。通过SZ.COM服务购买或获取任何数据、信息或进行交易等行为或替代行为产生的费用及损失。您对SZ.COM服务的误解。任何非因SZ.COM的原因而引起的与SZ.COM服务有关的其它损失。</p>
              <p>6.
                  不论在何种情况下，SZ.COM均不对由于信息网络正常的设备维护，信息网络连接故障，电脑、通讯或其他系统的故障，电力故障，罢工，劳动争议，暴乱，起义，骚乱，生产力或生产资料不足，火灾，洪水，风暴，爆炸，战争，政府行为，司法行政机关的命令或第三方的不作为而造成的不能服务或延迟服务承担责任。</p>
          </li>
          <li>
              <h3>6、协议的变更和终止</h3>
              <p>
                  <span>
                      协议的变更：SZ.COM有权随时对本协议内容或SZ.COM发布的其他服务条款及操作规则的内容进行变更，变更时SZ.COM将在SZ.COM站内显著位置发布公告，变更自公告发布之时生效，如用户继续使用SZ.COM提供的服务即视为用户同意该等内容变更，如用户不同意变更后的内容则用户有权注销SZ.COM账户、停止使用。
                  </span>
                  <span>
                      协议的终止：SZ.COM有权依据本协议约定注销用户的SZ.COM账号，本协议于账号注销之日终止。SZ.COM有权依据本协议约定终止全部SZ.COM服务，本协议于SZ.COM全部服务终止之日终止。
                  </span>
                  <span>有权永久冻结（注销）您的账户在SZ.COM的权限和收回账户对应的SZ.COM昵称</span>
              </p>
              <p>1. SZ.COM终止向您提供服务后，您涉嫌再一次直接或间接或以他人名义注册为SZ.COM用户的；</p>
              <p>2. 您提供的电子邮箱不存在或无法接收电子邮件，且没有其他方式可以与您进行联系，或SZ.COM以其它联系方式通知您更改电子邮件信息，而您在SZ.COM通知后三个工作日内仍未更改为有效的电子邮箱的；</p>
              <p>3. 您提供的用户信息中的主要内容不真实或不准确或不及时或不完整；</p>
              <p>4. 本协议（含规则）变更时，您明示并通知SZ.COM不愿接受新的服务协议的；</p>
              <p>5. 其它SZ.COM认为应当终止服务的情况。</p>
              <p>
                  <span>
                      本协议的终止不影响守约方向违约方追究违约责任.您的账户服务被终止或者账户在SZ.COM的权限被永久冻结（注销）后，SZ.COM没有义务为您保留或向您披露您账户中的任何信息，也没有义务向您或第三方转发任何您未曾阅读或发送过的信息。
                  </span>
                  <span>
                      您同意，您与SZ.COM的合同关系终止后，SZ.COM仍享有下列权利：继续保存您的用户信息及您使用SZ.COM服务期间的所有交易信息。您在使用SZ.COM服务期间存在违法行为或违反本协议或规则的行为的，SZ.COM仍可依据本协议向您主张权利。SZ.COM中止或终止向您提供SZ.COM服务后，对于您在服务中止或终止之前的交易行为依下列原则处理，您应独力处理并完全承担进行以下处理所产生的任何争议、损失或增加的任何费用，并应确保SZ.COM免于因此产生任何损失或承担任何费用：您在服务中止或终止之前已经上传至SZ.COM的比特币或其他币种尚未交易的，SZ.COM有权在中止或终止服务的同时删除此项物品的相关信息；您在服务中止或终止之前已经与其他会员达成买卖合同，但合同尚未实际履行的，SZ.COM有权删除该买卖合同及其交易比特币或其他币种的相关信息；您在服务中止或终止之前已经与其他会员达成买卖合同且已部分履行的，SZ.COM可以不删除该项交易，但SZ.COM有权在中止或终止服务的同时将相关情形通知您的交易对方。
                  </span>
              </p>
          </li>
          <li>
              <h3>7、隐私权政策</h3>
              <p>SZ.COM将在SZ.COM站公布并不时修订隐私权政策，隐私权政策构成本协议的有效组成部分。</p>
          </li>
          <li>
              <h3>8、法律适用、管辖与其他</h3>
              <p>1. 本协议之效力、解释、变更、执行与争议解决均适用新加坡当地法律，如无相关法律规定的，则应参照通用国际商业惯例和（或）行业惯例。</p>
              <p>2.
                  本协议包含了您使用SZ.COM需遵守的一般性规范，您在使用某个SZ.COM时还需遵守适用于该平台的特殊性规范（具体请参见您与该平台签署的其他协议以及平台规则等内容）。一般性规范如与特殊性规范不一致或有冲突，则特殊性规范具有优先效力。</p>
              <p>3.
                  因本协议产生之争议需根据您使用的服务归属的平台确定具体的争议对象，例如因您使用SZ.COM服务所产生的争议应由SZ.COM的经营者与您沟通并处理。一旦产生争议，您与SZ.COM的经营者均同意以被告住所地法院为第一审管辖法院。</p>
          </li>
      </ul>
      </div>
    } 
    else if(lang == 'en' ){
      content = 
      <div>
      <h1>SZ.COM User Agreement</h1>
      <span className='closeIcon'>
      <Icon type="close" onClick={this.handleClose}/>
      </span>
      <ul class="protocol_zh">
        <li>
          <h3>1、Agreement signing</h3>
          <p>
            1. This agreement includes the body text and various kinds of rules that have been issued or will be issued in the future
            by SZ.COM. All rules are integral parts of this agreement and shall have the same legal effect as the
            body text of the agreement. Except as otherwise explicitly stated, any services provided by SZ.COM and
            its affiliates (hereinafter referred to as SZ.COM services) are subject to this agreement.
            </p>
          <p>2. You must read the whole agreement carefully before using SZ.COM services. If you have any questions on
              the agreement, you shall consult SZ.COM. But whether or not you read the agreement carefully before using
              SZ.COM services, provided you use SZ.COM services, this agreement shall have binding effects on you,
              and you shall not declare this agreement to be void or request to revoke this agreement for having not
              read this agreement or having not received answers from SZ.COM to your inquiries and other reasons.
            </p>
          <p>3. You are committed to accepting and complying with the terms of this agreement. If you do not agree with
              this agreement, you shall immediately stop registration/ activation or stop using SZ.COM services.
            </p>
          <p>4. SZ.COM shall have the right to make and revise this agreement and/or various rules accordingly from time
              to time and to release announcements on the website without separate notice. The revised agreement and
              rules will take effect automatically once published on the website. If you do not agree with the relevant
              changes and revisions, you shall stop using SZ.COM services immediately. By continuing to use SZ.COM
              services, you consent to accepting the revised agreement and rules.
            </p>
        </li>
        <li>
          <h3>2、Registration and accounts</h3>
          <p>
            <span class="subTitle">1. Registrant qualification</span>
            <span>Users who have complete capacity for civil rights and civil conduct or who do not have complete capacity
                for civil rights and civil conduct but click the “Agree” button, are considered by this website as
                being approved by their legal representatives and registering with their legal representatives as
                agent to use SZ.COM services. If you do not have the aforesaid subject qualification, you and your
                guardian shall bear all the consequences arising and SZ.COM has the right to deactivate or permanently
                    freeze your account and to claim compensation from you and your guardian.</span>
          </p>
          <p>
            <span class="subTitle">2. Registration and accounts</span>
            <span>Users agree to provide valid contact information as required on the SZ.COM registration page, such as
                phone number, to set SZ.COM account and password. Users shall ensure the authenticity, integrity
                and accuracy of all information provided. Users who provide legal, complete and valid information
                required for registration have the right to acquire SZ.COM account and password, which are used to
                log in SZ.COM as a member. Acquisition of SZ.COM account and password is treated as successful registration.
                Users agree to receive email and/or messages sent by SZ.COM related to website administration and
                    operation.</span>
          </p>
          <p>
            <span class="subTitle">3. User information</span>
            <span>When there is reasonable ground to suspect you have provided wrong, false, outdated or illegal information,
                SZ.COM has the right to send you notices of inquiry or request to correct and to directly delete
                the relevant information. Your SZ.COM services may be partially or fully suspended or terminated
                . SZ.COM assumes no responsibility for this and you shall bear any direct or indirect loss and adverse
                    consequences arising out of it.</span>
            <span>You shall fill in accurately and update timely your email address, phone number, address, postal code
                and other contact information so that SZ.COM or other users can keep effective contact with you.
                You will be solely responsible for any loss, or incurred expenses during your use of SZ.COM services
                due to not being able to contact you as a result of providing incorrect contact. You understand and
                agree that you have an obligation to keep your contact information valid. In case of any change or
                    update, you shall follow the SZ.COM requirements.</span>
          </p>
          <p>
            <span class="subTitle">4. Account security</span>
            <span>You shall be responsible for the secrecy of your own SZ.COM nickname and password. You are held accountable
                for all the activities (including but not limited to disclosing information, releasing information,
                clicking online to agree or to submit various kinds of agreements on rules, renewing agreements online
                    or purchasing services) occurring in your login name, SZ.COM nickname and password. You agree to:</span>
            <span>(a)notify SZ.COM immediately in case of any unauthorized use of your SZ.COM nickname and password or
                    any other breaches of confidentiality provisions;</span>
            <span>(b)ensure that you strictly abide by the mechanism or process of safety, certification, transaction,
                    top-up and withdrawal on this website/services;</span>
            <span>(c)ensure that you leave the website/services in the proper procedure at the end of each online period.
                SZ.COM cannot and will not be responsible for any loss incurred from your failure to comply with
                this provision. You understand that it takes reasonable time for SZ.COM to act on your request and
                SZ.COM does not take responsibility for any consequences (including but not limited to any of your
                    loss) before taking action.</span>
          </p>
        </li>
        <li>
          <p>3、SZ.COM services</p>
          <p>1. Through SZ.COM services and other services provided by SZ.COM and its affiliates, members can release
              transaction information, inquire currency price and transaction information, reach transaction agreements
              and conduct transactions, participate in SZ.COM activities and use other information services and technical
                services.</p>
          <p>2. When dispute occurs during your transaction on SZ.COM with other members, once either or both of you and
              the opposite party submit it to SZ.COM for mediation, SZ.COM has the right to make mediation decisions
              according to unilateral judgment. You understand and agree to accept the judgment and mediation decision
                made by SZ.COM.</p>
          <p>3. You understand and consent that SZ.COM has the right to provide your local government departments (including
              judicial and administrative departments) at their request with necessary information such as user information
              and transaction records provided to SZ.COM. If you are suspected of infringement upon the civil rights
              and interests of others, with the preliminary judgment that the alleged infringement act exists, SZ.COM
              also has the right to provide necessary identity information of yours for the right holder.
            </p>
          <p>4. You are solely responsible for the taxes payable generated during your use of SZ.COM service, as well
                as all the expenses on hardware, software, services and any other aspects.</p>
        </li>
        <li>
          <h3>4、SZ.COM services specification</h3>
          <p>
            <span>1. You are committed to abiding by the following agreement when using SZ.COM services: All actions performed
                in the process of using SZ.COM services shall comply with the national laws, regulations and other
                normative documents in the country where you live as well as various SZ.COM rules and requirements,
                shall not violate public socials interests or public morality, shall not damage other’s legal rights
                and interests, shall not evade taxes payable and shall not violate this agreement and relevant rules.
                In case of any breaches of aforesaid commitment and any legal consequences caused, you shall take
                all the legal responsibilities independently in your own name and ensure SZ.COM against any resulting
                    loss.</span>
            <span>When transacting with other members, you shall abide by the principle of honesty and credibility, shall
                not take unfair competition acts, shall not disturb any normal order of online transactions and shall
                not engage in activities unrelated to online transactions. You shall not make use of any data on
                SZ.COM for commercial purpose without prior written consent from SZ.COM, including but not limited
                to using information displayed on SZ.COM by copying, spreading and other ways. You shall not interfere
                or attempt to interfere with the normal operation of SZ.COM or any transactions and activities on
                SZ.COM with any device, software or routine. You shall not take any action that will bring out unreasonable
                    heavy data load on SZ.COM network equipment.</span>
          </p>

          <p>
            <span>2. You understand and agree that SZ.COM has the right to decide unilaterally if you break the above commitment
                or not and to deal with it according to applicable rules or to terminate providing services to you
                without your consent or prior notice. Based on the needs to maintain SZ.COM transaction orders and
                transaction security, SZ.COM has the right to carry out actions including closing transaction orders
                in the event of maliciously selling or purchasing and other cases that disrupt the normal transaction
                order of the market. If any effective legal documents of the administrative and judicial authorities
                in your county or region confirms that you have unlawful or infringement acts, or if SZ.COM believes
                that your behavior is suspected of violating the provisions of this agreement and/or regulation or
                breaking laws and rules according to its own judgment, SZ.COM has the right to publish your unlawful
                acts or breach of contract along with the measures SZ.COM has taken on you. For the information you
                released on SZ.COM suspected of violation of laws or infringement upon other’s legal rights or breach
                of this agreement and/or regulation, SZ.COM has the right to delete it without further notice and
                    impose punishment in accordance with related provisions.</span>
            <span>For your actions performed on SZ.COM, including those you haven’t performed on SZ.COM but have had impact
                on SZ.COM and its users, SZ.COM has the right to decide unilaterally the nature of your actions and
                whether they constitute violation of this agreement and/or regulation, and to make corresponding
                punishment. You shall preserve all the evidence relating to your actions and shall bear the adverse
                consequences of not being able to provide sufficient evidence. For your suspected breach of commitment
                that has caused damage to any third party, you shall take all the legal responsibilities independently
                in your own name and ensure SZ.COM against any resulting loss or expense increase. If your suspected
                violation of laws or this agreement has made SZ.COM suffer any loss, or claims by any third party,
                or punishment by any administrative departments, you shall compensate SZ.COM for the loss and (or)
                    expenses incurred, including reasonable attorney fees.</span>
          </p>
        </li>
        <li>
          <h3>5、Scope and limitation of liability</h3>
          <p>1. SZ.COM is responsible for providing you with SZ.COM related services “as is” and according to “availability”,
              however SZ.COM makes no express or implied warranties of SZ.COM services, including but not limited to
              the applicability, freedom from error or omission, persistence, accuracy, reliability, and suitability
              for a specific purpose. Meanwhile, SZ.COM does not make any commitment and warranties of the effectiveness,
              accuracy, validity, reliability, quality, stability, integrity and timeliness of the technology and information
              involved in SZ.COM services.
            </p>
          <p>2. You understand that all the information on SZ.COM is released by SZ.COM members and there are probably
                risks and faults.</p>
          <p>3. SZ.COM serves only as a transaction venue. SZ.COM is only a place where you obtain information of various
              currencies represented by Bitcoin, look for transaction objects, negotiate and conduct transactions on
              Bitcoin and other currencies. However SZ.COM holds no control over the quality, safety or legality of
              Bitcoin and other currencies involved in the transactions, the authenticity or accuracy of transaction
              information, and the abilities of each party to meet its obligations in the transaction agreement. You
              shall carefully determine on your own the authenticity, legality and validity of relevant Bitcoin and/or
              information and bear the resulting responsibilities and loss incurred. SZ.COM is not obliged for prior
              reviewing the information data of all users, information of Bitcoin and other currencies, transaction
              behavior and other matters related to transactions, except as required by law or that the following conditions
              occur: There is reasonable ground for SZ.COM to believe that a particular member and specific transaction
              possibly violates the laws or agreement. There is reasonable ground for SZ.COM to affirm that users’
                actions are suspected of breaking the laws or improper.</p>
          <p>
            <span>4. SZ.COM, the third party authorized by SZ.COM or a third party you and SZ.COM agree on has the right
                to accept the disputes between you and other members based on your irrevocable authorization, and
                to unilaterally determine the facts related to the disputes and applicable rules so as to make a
                decision, including but not limited to adjusting the transaction status of orders, instructing a
                third-party payment company or customer service to pay all or part of the payment to one or both
                parties. This decision is binding on you. If you fail to carry out the decision within prescribed
                time limit, SZ.COM has the right (but no obligation) to directly pay with the money in your SZ.COM
                    account or the margin you paid to SZ.COM and its affiliates.</span>
            <span>You shall make up for the margin in time and compensate for the loss of SZ.COM and its affiliates, otherwise
                SZ.COM and its affiliates have the right to directly deduct your rights and interests under its contracts
                and to continue to claim for recovery. You understand and agree that SZ.COM, the third party authorized
                by SZ.COM or a non- judicial third party you and SZ.COM agree on can only identify the evidence as
                ordinary people; its mediation of disputes is completely based on your irrevocable authorization.
                It cannot guarantee that the mediation decision meets your expectations, nor does it take any responsibility
                for the mediation decision. If you suffer loss from it, you consent to claiming compensation on your
                    own from the beneficiary.</span>
          </p>
          <p>
            5. You understand and agree that SZ.COM is not liable for your damage compensation, including but not limited to loss on
            profits, goodwill, usage and data or other non-physical loss (whether SZ.COM has been told the possibility
            of such damage compensation) caused by the following situations: There is reasonable ground for SZ.COM
            to believe that a particular member and specific transaction possibly violate the laws or agreement;
            There is reasonable ground for SZ.COM to affirm that users’ actions are suspected of breaking the laws
            or improper; expenses or loss generated from purchasing or acquiring data and information from SZ.COM
            services, transactions or other alternative acts; your misunderstanding on SZ.COM services; any other
            loss related to SZ.COM services but not caused by SZ.COM.
            </p>
          <p>
            6. Under whatever circumstances, SZ.COM takes no liability for any failure or delay of services owing to normal information
            network equipment maintenance, information network connection faults, malfunction of computer, communications
            and other systems, power failures, strikes, labor disputes, riots, uprisings, disturbances, insufficient
            productivity or means of production, fires, floods, storms, explosions, wars, government acts, commands
            from judicial and administrative authorities, inaction by a third party.
            </p>
        </li>
        <li>
          <h3>6、Agreement modification and termination</h3>
          <p>
            <span>Modification in the agreement: SZ.COM has the right to modify at any time this agreement or other terms
                of service and operation rules released by SZ.COM. SZ.COM will publish notable announcements of modification
                on the website. The modification takes effect on the day of announcement. By continuing to use SZ.COM
                services provided, users consent to such modification. If users do not agree with the modified content,
                they have the right to log out of their SZ.COM accounts and stop using SZ.COM services.
                </span>
            <span>Termination of the agreement: SZ.COM has the right to deactivate users' SZ.COM accounts in accordance
                with this agreement. This agreement shall be terminated on the day of account deactivation. SZ.COM
                has the right to terminate all SZ.COM services according to this agreement. This agreement shall
                    be terminated on the day of termination of all SZ.COM services.</span>
            <span>SZ.COM has the right to permanently freeze (deactivate) your SZ.COM account and withdraw the corresponding
                    SZ.COM nicknames:</span>
          </p>
          <p>1. After SZ.COM terminates providing services for you, you are suspected of registering to be a SZ.COM user
                directly or indirectly in the name of others;</p>
          <p>2. The email address you provide does not exist or cannot receive emails and there is no other way to contact
              you, or SZ.COM notifies you to change email information but you fails to do change it to valid email
                within three working days after SZ.COM notice;</p>
          <p>3. The main part of your user information lacks authenticity, accuracy, timeliness or integrity;</p>
          <p>4. When this agreement (including regulation) is modified, you expressly inform SZ.COM that you are not willing
                to accept the new service agreement;</p>
          <p>5. 其它SZ.COM认为应当终止服务的情况。</p>
          <p>
            <span>5. Other circumstances on which SZ.COM believes that services should be terminated.</span>
            <span>The termination of this agreement shall not affect the non-breaching party calling the breaching party
                to account for breach of contract. After your account services are terminated or your account is
                permanently frozen (deactivated) in SZ.COM, SZ.COM has no obligation to preserve or disclose any
                    information in your account to you, or to forward unread or unsent messages to you or any third party.</span>
            <span>You agree that SZ.COM is still entitled to the following rights after the termination of your contract
                with SZ.COM: continuing to preserve your user information and all transaction information during
                your use of SZ.COM services. If there is any violation of laws or this agreement during your use
                of SZ.COM services, SZ.COM can claim rights from you in accordance with this agreement. After SZ.COM
                suspends or terminates providing you with SZ.COM services, the transactions occurring before the
                suspension or termination shall be dealt with in accordance with the following principles. You shall
                independently deal with and fully undertake any disputes, loss or expense increase during the process
                and ensure SZ.COM against from any loss or costs: For Bitcoin or other currencies you have uploaded
                but not transacted before suspension or termination of services, SZ.COM has the right to delete related
                information of such items at the same time of service suspension or termination; If you have reached
                a sales contract with other members but not performed it before suspension or termination of services,
                SZ.COM has the right to delete the contract and related transaction information of Bitcoin or other
                currencies; If you have reached a sales contract with other members and partly performed it before
                suspension or termination of services, SZ.COM may not delete the transaction but SZ.COM has the right
                    to inform your transaction opponent of related situation when suspending or terminating the services.</span>
          </p>
        </li>
        <li>
          <h3>7、Privacy Policy</h3>
          <p>SZ.COM will publish and revise the privacy policy from time to time at SZ.COM website. Privacy policy constitutes
                a significant part of this agreement.</p>
        </li>
        <li>
          <h3>8、Applicable law, jurisdiction and others</h3>
          <p>1. The efficiency, interpretation, modification, implementation and dispute resolution of this agreement
              is governed by the law of Singapore. If there is no relevant laws and regulations, universal international
                business practices and/or industry practices shall be referred to.</p>
          <p>2. This agreement contains general norms you must comply with when using SZ.COM. You shall also comply with
              the specific norms applicable to the platform (see other agreements you signed with the platform and
              rules of the platform, etc). When inconsistency or conflict occurs between the general norms and specific
                ones, the latter shall prevail.</p>
          <p>3. For disputes arising from this agreement, specific dispute objects shall be determined according to the
              platform to which your services belong, for example, disputes due to the use of SZ.COM services shall
              be communicated with and handled by the operator of SZ.COM. Once the dispute arises, you and SZ.COM operator
              both agree that the court where the defendant is domiciled shall be the court of first instance.
            </p>
        </li>
      </ul>
      </div>
    }
  
    return (
        <div className={"regModeShard "+(isShow ? '' : 'stateHid')}>
          <div className="regState">
          {content}
          {/* <button className='regState-btn' onClick={this.handleClose}>同意</button> */}
        </div>
        </div>
    )
  }
}
const mapStateToProps = (state)=>{
  return {
      lang : state.lang.lang
  }
};

export default connect(mapStateToProps)(RegState)
