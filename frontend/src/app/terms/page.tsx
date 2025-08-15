'use client';

import { useLanguage } from '@/components/providers/LanguageProvider';

export default function TermsPage() {
  const { locale } = useLanguage();

  if (locale === 'en') {
    return (
      <main className="container mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold mb-2">Terms of Service</h1>
        <p className="text-sm text-muted-foreground mb-8">Last updated: August 14, 2025</p>

        <p className="text-muted-foreground mb-8">
          These Terms of Service (the &quot;Terms&quot;) set forth the conditions for using the profile generator site &quot;ocha&quot; (the &quot;Service&quot;).<br />
          By using the Service, you are deemed to have agreed to these Terms.
        </p>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Article 1 (Application)</h2>
          <p className="text-muted-foreground">
            These Terms apply to all relationships related to the use of the Service between users and the operator of the Service.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Article 2 (Registration)</h2>
          <p className="text-muted-foreground mb-2">When using the Service, you may be required to enter registration information as necessary.</p>
          <p className="text-muted-foreground">Users must enter accurate and up-to-date information.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Article 3 (Prohibited Acts)</h2>
          <p className="text-muted-foreground mb-4">Users must not engage in the following acts:</p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            <li>Acts that violate laws or public order and morality</li>
            <li>Acts that infringe on the rights of others (copyrights, trademarks, privacy rights, etc.)</li>
            <li>Entering false information</li>
            <li>Unauthorized access or attacks on servers</li>
            <li>Acts that interfere with the operation of the Service</li>
            <li>Malicious use of generated text (fraud, impersonation, defamation, etc.)</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Article 4 (Suspension/Changes to the Service)</h2>
          <p className="text-muted-foreground mb-4">The Service may be suspended or interrupted without prior notice to users in the following cases:</p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            <li>System maintenance or failure</li>
            <li>Force majeure such as natural disasters</li>
            <li>Termination or changes to the Service at the operator&apos;s discretion</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Article 5 (Disclaimer)</h2>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            <li>The Service does not guarantee the accuracy, completeness, or usefulness of generated profile text.</li>
            <li>The operator is not responsible for any damages arising from users&apos; use of generated results.</li>
            <li>The operator is not responsible for any issues arising on external services or third-party sites linked from the Service.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Article 6 (Copyright)</h2>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            <li>Users retain rights to the information they input.</li>
            <li>Users may freely use generated text, provided such use does not violate any laws.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Article 7 (Changes to the Terms)</h2>
          <p className="text-muted-foreground">
            The operator may change these Terms as necessary. Changes will take effect when posted on the Service.
          </p>
        </section>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-2">利用規約</h1>
      <p className="text-sm text-muted-foreground mb-8">最終更新日：2025年8月14日</p>

      <p className="text-muted-foreground mb-8">
        この利用規約（以下「本規約」）は、プロフィールジェネレーターサイト「ocha」（以下「本サービス」）の利用条件を定めるものです。<br />
        本サービスを利用することで、本規約に同意したものとみなします。
      </p>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">第1条（適用）</h2>
        <p className="text-muted-foreground">
          本規約は、ユーザーと本サービス運営者との間の利用に関わる一切の関係に適用されます。
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">第2条（利用登録）</h2>
        <p className="text-muted-foreground mb-2">本サービスの利用にあたり、必要に応じて登録情報の入力を求める場合があります。</p>
        <p className="text-muted-foreground">ユーザーは、正確かつ最新の情報を入力してください。</p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">第3条（禁止事項）</h2>
        <p className="text-muted-foreground mb-4">ユーザーは、以下の行為を行ってはなりません。</p>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground">
          <li>法令または公序良俗に違反する行為</li>
          <li>他人の権利を侵害する行為（著作権、商標権、プライバシー権など）</li>
          <li>虚偽の情報入力</li>
          <li>不正アクセスやサーバーへの攻撃</li>
          <li>本サービスの運営を妨害する行為</li>
          <li>生成された文章を悪用する行為（詐欺、なりすまし、誹謗中傷など）</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">第4条（サービス提供の停止・変更）</h2>
        <p className="text-muted-foreground mb-4">本サービスは、以下の場合にユーザーへの事前通知なく提供を中断または停止できるものとします。</p>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground">
          <li>システム保守や障害発生時</li>
          <li>天災地変や不可抗力による停止</li>
          <li>運営上の判断によるサービス終了または変更</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">第5条（免責事項）</h2>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground">
          <li>本サービスは、生成されたプロフィール文の正確性、完全性、有用性を保証しません。</li>
          <li>ユーザーが生成結果を利用したことによって生じた損害について、運営者は一切の責任を負いません。</li>
          <li>外部サービスや第三者サイトへのリンク先で発生した問題について、運営者は責任を負いません。</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">第6条（著作権）</h2>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground">
          <li>ユーザーが入力した情報については、ユーザーが権利を有します。</li>
          <li>生成された文章については、ユーザーが自由に利用できますが、法令に反する利用は禁止します。</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">第7条（規約の変更）</h2>
        <p className="text-muted-foreground">
          運営者は必要に応じて本規約を変更できるものとします。変更後は、本サービス上に掲載された時点で効力を生じます。
        </p>
      </section>
    </main>
  );
}
