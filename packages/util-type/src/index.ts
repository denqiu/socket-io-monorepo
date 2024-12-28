/**
 * [code-review/comments, Comment Id: 01JEMYS13NZM5TSF8RE1JC1KKE]
 * Convert index positions of array into union.
 * @example
 * type Arr = ['a', 'b', 'c'];
 * type E = 'a' | 'b' | 'c';
 * E === Union<Arr>
 */
type Union<Arr extends readonly any[]> = Arr[number];

type SampleProps = {
    /**
     * [code-review/comments, Comment Id: 01JEMYS13P57G95SSX460FKMXE]
     * Id
     */
    id: string;
    /**
     * [code-review/comments, Comment Id: 01JEMYS13P4EX3DDCW5BGXZW5J]
     * Label
     */
    label: string;
    /**
     * [code-review/comments, Comment Id: 01JEMYS13P41BAMRQ04TSJJ91W]
     * Items
     */
    items: any[];
    /**
     * [code-review/comments, Comment Id: 01JEMYS13PWEWFK6JCBZMTM458]
     * @param item Item
     */
    func: (item: any) => void;
};

/**
 * [code-review/comments, Comment Id: 01JEMYS13QNFZB1K8773859JCH]
 * Has all the same properties as SampleProps but introduces T parameter.
 *
 * We won't do anything with T. Simply introducing T is enough.
 * 
 * Using this type is exactly the same as using SampleProps.
 */
type SamplePropsWithGenerics<T> = {
    [Props in keyof SampleProps]: SampleProps[Props]
};

class HowToExpandProps {
    wrongWay(sample?: { [Props in keyof SampleProps]: SampleProps[Props] }) {
        console.warn("Properties are not inferred. Hover over this function and autocomplete displays { [Props in keyof SampleProps]: SampleProps[Props] } syntax.");
    }

    betterWayButDuplicated<S extends SampleProps>(sample: { [Props in keyof S]: S[Props] }) {
        console.log("Properties are inferred but they appear twice. Hover over this function and autocomplete displays twice { id: string, label: string, items: any[], func: (item: any) => void } syntax.");
    }

    correctWayWithGenerics<T>(sample: { [Props in keyof SamplePropsWithGenerics<T>]: SamplePropsWithGenerics<T>[Props] }) {
        console.log("Properties are inferred and appear correctly. Hover over this function and autocomplete displays { id: string, label: string, items: any[], func: (item: any) => void } syntax.");
    }
}

/**
 * [code-review/comments, Comment Id: 01JEMYS13Q3BF48697M6PT4Y6G]
 * Explain keyof with objects and interfaces and types from util-event
 */

export {
    type Union,
    type SampleProps,
    HowToExpandProps
};