Исходный код из этого каталога будет автоматически добавлен к путям классов
"классического" приложения extjs. Для "неклассических" приложений необходимо вручную загружать классы.

Реализованные возможности:
1. [Базовые возможности контроллеров](https://github.com/Unact/sencha-common/tree/master/common/src/lib/app):
 - [примесь для контроллеров с возможностями загрузки хранилищ и обработки ошибок сервера](https://github.com/Unact/sencha-common/blob/master/common/src/lib/app/ControllerMixin.js)
 - [заготовка контроллера маршрутизации для работы с меню и карточным режимом вывода](https://github.com/Unact/sencha-common/blob/master/common/src/lib/app/Routing.js)
 - [заготовка контроллера представления для обработки событий загрузки "своих" хранилищ и хранилищ приложения](https://github.com/Unact/sencha-common/blob/master/common/src/lib/app/ViewController.js)
2. [Данные](https://github.com/Unact/sencha-common/tree/master/common/src/lib/data):
 - [поле модели, которое принимает значение null, если входящее значение - пустая строка](https://github.com/Unact/sencha-common/blob/master/common/src/lib/data/field/NullifiedString.js)
 - [поле модели для работы с различными форматами дат](https://github.com/Unact/sencha-common/blob/master/common/src/lib/data/field/RestXmlDate.js)
 - [посредник для работы с сервером в формате json без отправки данных о разбиении на страницы](https://github.com/Unact/sencha-common/blob/master/common/src/lib/data/proxy/RestJsonLimitless.js)
 - [посредник для работы с полиморфными сущностями](https://github.com/Unact/sencha-common/blob/master/common/src/lib/data/proxy/RestPolymorphic.js)
 - [специализированное хранилище для работы с xml-шлюзом](https://github.com/Unact/sencha-common/blob/master/common/src/lib/data/RestXmlStore.js)
3. Таблица:
 - ["combocolumn" - специальный класс колонки, которая должна отображать значения по внешнему ключу из другого хранилища](https://github.com/Unact/sencha-common/blob/master/common/src/lib/grid/column/ComboColumn.js)
 - [плагин для работы с буфером обмена](https://github.com/Unact/sencha-common/blob/master/common/src/lib/grid/plugin/RowClipboard.js). стандартный не работает в safari
 Также реализованы дополнительные возможности обработки данных.
 - [отдельное окно для редактирования значений записи таблицы](https://github.com/Unact/sencha-common/blob/master/common/src/lib/grid/EditingCard.js)
 - [таблица со стандартным набором кнопок, сохранением состояния и настроенными плагинами](https://github.com/Unact/sencha-common/blob/master/common/src/lib/grid/Panel.js)
4. Общие вещи:
 - [checkmarktoolbar](https://github.com/Unact/sencha-common/blob/master/common/src/lib/shared/CheckmarkToolbar.js)
 - [конвертер CSV](https://github.com/Unact/sencha-common/blob/master/common/src/lib/shared/Csv.js)
 - [примесь для компонентов, которые должны быть детализацией какой-либо таблицы](https://github.com/Unact/sencha-common/blob/master/common/src/lib/shared/Detailable.js)
 - [панель со стандартным набором кнопок (CRUD)](https://github.com/Unact/sencha-common/blob/master/common/src/lib/shared/Toolbar.js)
5. Заготовки для компонентов обычных таблиц и таблиц для работы с деревьями:
 - [заготовки представлений](https://github.com/Unact/sencha-common/blob/master/common/src/lib/singlegrid/View.js)
 - [заготовки контроллеров представлений с реализацией всех CRUD-действий](https://github.com/Unact/sencha-common/blob/master/common/src/lib/singletable/ViewController.js)
 При использовании можно не создавать отдельный контроллер, если все действия типовые и не требуют настройки поведения.
6. ["Плоская" таблица - простой вывод xml-данных в виде горизонтальной или вертикальной таблицы](https://github.com/Unact/sencha-common/blob/master/common/src/lib/view/PlainTable.js)
7. [Специальные функции для проверки ИНН, номера лицевого счета](https://github.com/Unact/sencha-common/blob/master/common/src/lib/Checkers.js)
8. [Заготовка для компонента фильтра дат](https://github.com/Unact/sencha-common/blob/master/common/src/lib/DateIntervalFilter.js)
