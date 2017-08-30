# meta-validate
Декораторы для валидации классов.

### Общие принципы:
#### 1 - валидаторы складываются в цепочку.
Цепочка всегда начинается с `@MetaValidate.` и заканчивается на `.make()`
#### 2 - ошибки складываются в объект следующего вида:
```
{
    errors: {
        %ПОЛЕ%: {
            %КЛЮЧ_ОШИБКИ_1%: boolean,
            %КЛЮЧ_ОШИБКИ_2%: boolean,
        },
        %ПОЛЕ_КОМПОЗИЦИЯ%: {
            %ПОЛЕ_КЛАССА_КОМПОЗИЦИИ_1%: {
                %КЛЮЧ_ОШИБКИ_1%: boolean
                ...
            }
        }
    }
}
```
#### 3 - есть пренастроенные классы валидаторов и можно будет регистрировать свои(скоро)
Это значит, что сам по себе `@MetaValidate` просто хранилище всяких классов с валидаторами. Сейчас их несколько:
- `Number<T>` - класс с частыми валидаторами чисел
- `String<T>` - класс с частыми валидаторами строк
- `Trigger` - класс-триггер, нужен для связывания полей
- `Nested` - класс, обозначающий что поле содержит сложный экземпляр, который тоже умеет валидироваться
- `Base` - класс с базовыми методами, предполагающий использование только кастомных валидаторов
Дженерики принимают класс, поля которого вы валидируете.

#### 4 - ваши классы должны реализовывать интерфейс ReceiveValidity
В вашем классе обязательно должно быть поле `validity$: Subject<Validity>`, в который будут валиться ошибки.

#### 5 - семантика валидаторов.
Валидаторы возвращают false, если значение валидно. true - если есть ошибка. Т.е. валидатор отвечает на вопрос - есть-ли ошибка?

Это сделано для того, чтобы использовать объект с ошибками в шаблонах без всяких плясок вокруг ng-if. Пишем `<span class="error" ng-if="validity.field.min">Ошибочка min, маловато ввели</span>`

#### 6 - преднастроенные валидаторы умеют принимать как значение, так и функцию от экземпляра

#### 7 - валидаторы запускаются на каждый чих над полем или связанными полями


### Базовое использование
Пример
```
class Foo {
    validity$: BehaviorSubject<Validity> = new BehaviorSubject();

    @MetaValidate.MVString<Foo>().required().make()
    bar: number = null;
}
```
Здесь
- @MetaValidate - тот самый базовый декоратор
- MVString<T> - один из преднастроенных классов с валидаторами
- .make() - метод, делающий декорацию

### Базовый класс валидаторов и его методы
Базовый класс валидаторов - от него наследуются все конкретные классы с валидаторами.

Содержит общие методы, которые нужны всем.

Список методов
- `required()` - делает поле обязательным к проверке. Ключ ошибки: `required`
- `skipIf(condition: (instance) => boolean)` - метод, который можно повесить после валидатора, он запустит переданную функцию-условие с экземпляром вашего класса в качестве аргумента, и в зависимости от этого запустит или нет валидатор для предыдущего поля. В случае, если функция-условие вернет true - валидатор не будет запущен, ошибка будет false для него.
- `skip(condition: (instance) => boolean)` - метод, который обычно стоит вешать первым в цепочке, по условию определяет - запускать все валидаторы на поле или игнорировать его. В случае, если функция-условие вернет true - ни один валидатор для поля не будет запущен, во всех ключах ошибок будет false.
- `with(fields: Array<string>)` - список полей, с изменением которых будут вызваны проверки данного поля. Эти зависимые поля должны быть либо так же валидируемы, либо если они не требуют специальной валидации - декорированы специальным классом `Trigger`
- `custom(name: string, validator: (value: any, instance: any) => boolean)` - кастомный валидатор, который можно повесть на поле. Обязательно должен возвращать boolean, в любом случае.
- `make()` - конечный метод цепочки, декорирует свойство

### Класс String
Использование
```
@MetaValidate.String<T>()...make()
field: string = null;
```
Валидаторы:
- `minLength(len: number | (instance) => number)` - минимальная длина значения должна быть len. Ключ ошибки - `minLength`
- `maxLength(len: number | (instance) => number)` - максимальная длина значения должна быть len. Ключ ошибки - `maxLength`
- `length(len: number | (instance) => number)` - Длина значения должна быть строго len. Ключ ошибки - `length`
- `regex(len: pattern | (instance) => pattern)` - Значение должно соответствовать регулярке. Рекомендуется не забывать в регулярке ^$. Ключ ошибки - `regex`
- `alphanum` - Поле должно содержать только цифры и буквы. Ключ ошибки - `alphanum`
- `token` - Поле должно содержать только цифры, буквы, тире и подчеркивание. Ключ ошибки - `token`

### Класс Number
Использование
```
@MetaValidate.Number<T>()...make()
```
Преднастроенные валидаторы пытаются привести значение к числу. Т.е. например ng-model инпута может быть забито на поле с этими валидаторами, и они будут приовдить значение к числу. Но только для проверки. Приведение для хранения - пока ваша задача. Скоро будет метод `convert` в цепочке валидаторов, он будет отвечать за приведение

Валидаторы:
- `min(len: number | (instance) => number)` - число должно быть строго больше переданного значения
- `greater(len: number | (instance) => number)` - число должно быть больше или равно переданного значения
- `max(len: number | (instance) => number)` - число должно быть строго меньше переданныого значения
- `less(len: number | (instance) => number)` - число должно быть меньше или равно переданного значения
- `integer()` - число должно быть без знаков после запятой
- `negative()` - число должно быть отрицательным
- `positive()` - число должно быть положительным
- `divideBy(arg: number | (instance) => number)` - число делится на переданный аргумент

### Объект с ошибками Validity
Вид объекта представлен выше в документации. У него есть дополнительный метод `.isFullValid(ignoreFields: Array<string>)` - вернет true, если все поля валидны. Исключает поля из списка ignoreFields. Они могут быть вложенными, например: `document.number`

###Пример использования
```
import { MetaValidate, ReceiveValidity, Validity } from 'meta-validate';

class Document implements ReceiveValidity {
    validity$: BehaviorSubject<Validity> = new BehaviorSubject(null);

    @MetaValidate.Trigger().make()
    docType: string = null;

    @MetaValidate.String<Document>()
    .with(['docType'])
    .required().skipIf(instance => instance.docType === 'dumb')
    .alphanum()
    .custom('length', (value, instance) => instance.docType === 'pass_rf' ? !value || value.length !== 4 : !value || value.length === 0)
    .make()
    docNumber: string = null;

    @MetaValidate.String<Document>()
    .with(['docType'])
    .required()
    .minLength(2)
    .maxLength(4)
    .make()
    docSeries: string = null;

    @MetaValidate.String<Document>()
    .skip(instance => instance.docType !== 'zagranpasport')
    .length(9)
    .make()
    additionalDocumentNumber: string = null;
}

class Customer implements ReceiveValidity {
    validity$: BehaviorSubject<Validity> = new BehaviorSubject();

    @MetaValidate.Nested().make()
    document: Document = new Document();

    @MetaValidate.String<Customer>().required().make()
    name: string = null;
}
```

Объект ошибок будет следующим:
```
customerErrors = {
    errors: {
        document: {
            docNumber: {
                required: true,
                alphanum: true,
                length: true
            },
            docSeried: {
                required: true,
                minLength: true,
                maxLength: true
            },
            additionalDocumentNumber: {
                length: true
            }
        }
        name: {
            required: true
        }
    }
}
```

Пользоваться следующим образом:
```
const customer = new Customer();
customer.validity$.subscribe((validity: Validity) => {
    this.errors = validity.errors;
    this.isFullValid = validity.isFullValid();
});
```